
echo off
echo ---
localhost:8100/auv
pause
start 
pause
@REM ionic serve --browseroption=/phan

--- VS Shortkeys ---

Fold/Unfold JSON
https://stackoverflow.com/questions/30067767/how-do-i-fold-collapse-hide-sections-of-code-in-visual-studio-code

--- EMULATOR
cd d:/dev/family/emulator/
firebase emulators:start --import=./firebaseExport --export-on-exit=./firebaseExport
http://localhost:4000/
firebase deploy --only functions:pushMessages

--- APP
cd d:/dev/family/
ionic serve
ionic serve --browseroption=/phan
ionic serve --browseroption=/phan/1234

--- PROD
ionic build --prod
@REM firebase deploy --only hosting:giapha

firebase target:apply hosting giaphahophan giaphahophan
firebase deploy --only hosting:giaphahophan