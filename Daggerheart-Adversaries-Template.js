// Github:   not yet
// By:       Martijn Sanders
// Contact:  https://app.roll20.net/users/2575981/martijn-s
// Forum:    na

const DaggerheartAdversaries = (() => {
  // eslint-disable-line no-unused-vars
  "use strict";

  const scriptName = "DaggerheartAdversaries";
  const version = "0.0.1";
  const lastUpdate = "20250715";
  const GENERIC_TOKEN = "https://files.d20.io/images/448900892/QqalcZWIlO5ILQru75S9lg/thumb.png?1752643619";

  const checkInstall = () => {
    log(`-=> ${scriptName} v${version} <=- [${lastUpdate}]`);
  };

  // generic helper functions
  const mylog = (msg) => {
    const lines = new Error().stack.split("\n");
    log(`${new Date().toUTCString()} ${scriptName} ${lines[2].trim()} ${msg}`);
  };
  const getCleanImgsrc = (imgsrc) => {
    let parts = imgsrc.match(/(.*\/(?:images|marketplace)\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
    if (parts) {
      return parts[1] + "thumb" + parts[3] + (parts[4] ? parts[4] : `?${Math.round(Math.random() * 9999999)}`);
    }
    return;
  };
  const setDefaultToken = (c, a) => {
    const dt = {
      pageid: Campaign().get("playerpageid"),
      subtype: "token",
      imgsrc: getCleanImgsrc(c.get("avatar")),
      name: c.get("name"),
      represents: c.get("id"),
      left: 0,
      top: 0,
      width: 70,
      height: 70,
      layer: "objects",
      showname: true,
      showplayers_name: true,
      bar1_value: "",
      bar1_max: "",
      showplayers_bar1: false,
      bar2_value: a["stress"],
      bar2_max: a["stress"],
      showplayers_bar2: false,
      bar3_value: a["hp"],
      bar3_max: a["hp"],
      showplayers_bar3: true,
      tooltip: "",
    };

    const token = createObj("graphic", dt);
    // createObj ignores many passed values, so explicitly set ignored values again
    for (const [key, value] of Object.entries(dt)) {
      if (value !== token.get(key)) {
        token.set(key, value);
      }
    }
    mylog(`character ${c.get("_id")} defaulttoken set as ${JSON.stringify(token)}`);
    setDefaultTokenForCharacter(c, token);
    token.remove();
  };

  const setAttribute = (character, name, value) => {
    const attrs = findObjs({ type: "attribute", _characterid: character.get("id"), name: name });
    if (attrs.length > 0) {
      attrs[0].set({ current: value });
    } else {
      createObj("attribute", { _characterid: character.id, name: name, current: value });
    }
  };

  const setAbility = (character, name, action) => {
    const abilities = findObjs({ type: "ability", _characterid: character.get("id"), name: name });
    if (abilities.length > 0) {
      abilities[0].set({ action: action, istokenaction: true });
    } else {
      createObj("ability", { _characterid: character.id, name: name, action: action, istokenaction: true });
    }
  };

  const handleAdversary = (a) => {
    mylog(`handleAdversary ${JSON.stringify(a)} `);
    const characters = findObjs({ type: "character", name: a["name"] });
    const char =
      characters.length > 0
        ? characters[0]
        : createObj("character", {
            name: a["name"],
            avatar: GENERIC_TOKEN,
            bio: a["description"],
            gmnotes: a["motives_and_tactics"],
          });

    setAttribute(char, "hp", a["hp"]);
    setAttribute(char, "stress", a["stress"]);
    setAttribute(char, "thresholds", a["thresholds"]);
    setAttribute(char, "tier", a["tier"]);
    setAttribute(char, "type", a["type"]);
    setAttribute(char, "difficulty", a["difficulty"]);

    const abilities = findObjs({ type: "ability", _characterid: char.get("id") });
    for (const a of abilities) {
      a.remove();
    }
    // !dgha  --create

    const genAction =
      `/w gm &{template:default} ` +
      ` {{Name= ${a["name"]}}}` +
      ` {{👑 Difficulty= ${a["difficulty"]}}}` +
      ` {{💉 Thresholds= ${a["thresholds"]}}}`;
    setAbility(char, `👑 Difficulty ${a["difficulty"]}`, genAction);
    setAbility(char, `💉 ${a["thresholds"] == "None" ? "Minion" : "Thresholds " + a["thresholds"]}`, genAction);

    const dType = a["damage"].indexOf("phy") > -1 ? "Physical" : "Magical";
    const dDamage = a["damage"].replace(" phy", "").replace(" mag", "");
    const attAction = `/as “@{selected|character_name}” &{template:default} {{Attack= ${a["attack"]}}} {{Roll= [[1d20+${a["atk"]}]]}} {{Advantage  Disadvantage= [[1d20+${a["atk"]}]]}} {{Damage [[${dDamage}]]}} {{Range = ${a["range"]}}} {{Damage Type = ${dType}}}`;
    setAbility(char, `⚔️ ${a["attack"]}`, attAction);
    for (const f of a["feats"]) {
      mylog(`handleAdversary f ${JSON.stringify(f)} `);
      const nSplit = f["name"].split(" - ");

      let icon = "💥";
      if (nSplit[1] == "Action") {
        icon = "💥";
      } else if (nSplit[1] == "Reaction") {
        icon = "💫";
      } else if (nSplit[1] == "Passive") {
        icon = "📎";
      }
      const featAction = `/as “@{selected|character_name}” &{template:default} {{${icon} ${nSplit[1]}= ${nSplit[0]}}} {{Description= ${f["text"]}}}`;
      setAbility(char, `${icon} ${nSplit[0]}`, featAction);
    }

    mylog(`handleAdversary experience ${a["experience"]} `);
    if (a["experience"]) {
      for (const e of a["experience"].split(",")) {
        const et = e.trim().split(" ");
        if (et.length == 2) {
          const eAction = `/as “@{selected|character_name}” &{template:default} {{📜 Experience=${et[0]} ${et[1]}}}`;
          setAbility(char, `📜 ${et[0]}`, eAction);
        }
      }
    }
    setDefaultToken(char, a);
  };

  const handleAdversaries = () => {
    const bAdversaries = adversaries.slice();
    const burndownAdversaries = () => {
      const adv = bAdversaries.shift();
      if (adv) {
        handleAdversary(adv);
        setTimeout(burndownAdversaries, 0);
      }
    };
    burndownAdversaries();
  };

  const handleInput = (msg) => {
    var args, player, who;
    if (msg.type !== "api") {
      return;
    }
    player = getObj("player", msg.playerid);
    who = (player || { get: () => "API" }).get("_displayname").split(" ")[0];
    args = msg.content.split(/\s+/);
    mylog(`handleInput ${who} ${args}`);
    switch (args.shift()) {
      case "!dgha":
        mylog(`${msg.playerid} ${msg.content}`);
        if (_.contains(args, "--create")) {
          handleAdversaries(who);
        }
        break;
    }
  };
  const registerEventHandlers = () => {
    on("chat:message", handleInput);
  };
  on("ready", () => {
    checkInstall();
    registerEventHandlers();
  });

  const adversaries = [];

  return {
    // Public interface here
  };
})();
