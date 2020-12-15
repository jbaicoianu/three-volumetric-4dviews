******************************************
         4DViews Web player API
******************************************


V1.0


** Licensing

Please read the End User License Agreement (EULA) file attached.


** Overview

The 4DViews Web player API provides JavaScript functions allowing to read, decode, 
and display 4Dviews volumetric 4ds files over http.

** Files

CODEC.js/CODEC.wasm
Base code for data decoding. You don't want to edit these files as they are automatically generated from c++ code.

resource_manager.js
Code handling the data chunks download from the server, and their decoding (calling CODEC.js functions)

player4D.js
Main code managing the playback of the 4d sequence. It calls the other scripts to download and display the data.

playerUI.js
Handles the user interface and interactions of the web player.

viewer.js
Functions based on Three.js for the 3D viewing of the data

