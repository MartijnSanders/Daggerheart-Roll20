# Daggerheart-Roll20
Helpers for playing Daggerheart on Roll20. 



# Adversaries.js
This is a temporary solution to support Daggerheart Adversaries in Roll20 until the demiplane-roll20 integration supports Adversaries.
See https://app.roll20.net/forum/permalink/12368573/ and https://app.roll20.net/forum/permalink/12408912/ .

This solution is intended to comply with the Darrington Press Community Gaming License (https://darringtonpress.com/wp-content/uploads/2025/06/DPCGL-June-26-2025.pdf), but i am no lawyer.

Step 1: Create a game with **no** character sheet. 

Step 2: Obtains a copy of https://github.com/seansbox/daggerheart-srd/blob/main/.build/json/adversaries.json

Step 3: Open Daggerheart-Adversaries-Template.js in a code editor and insert the content of above json in the line 
```const adversaries = [];```
Line 192 abouthish, almost at the bottome of the file.

Step 4: 

Step 1: mod creates srd adversaries based on adversaries.json found in https://github.com/seansbox/daggerheart-srd. 
Attributes and abilities are created based on https://www.youtube.com/watch?v=nreo4xyZQE4.
Also a default image is used as avatar en default token (image created by me).

Step 2: manually drop images in the avatars of the adversaries/npcs

Step 3: run mod to update the tokens.

Still not as easy as with DND npcs. But it is mostly automated and repeatable if/when npc attributes might be cleared. 

Step 4: Transmogrify the used adversaries into my play game


Not perfect, but good enough to survive until rhe demiplane-roll20 integration catches up.
