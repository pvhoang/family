
echo off
echo ---
start ionic build --prod
pause
start firebase deploy --only hosting:giapha
pause

<<<<<<< Updated upstream

=======
@REM ionic serve --browseroption=/phan
@REM ionic serve --browseroption=/aedit


ionic build --prod
firebase deploy --only hosting:giapha
>>>>>>> Stashed changes

--- EMULATOR
cd d:/dev/family/emulator/
firebase emulators:start --import=./firebaseExport --export-on-exit=./firebaseExport
http://localhost:4000/
firebase deploy --only functions:pushMessages

--- APP
cd d:/dev/family/
ionic serve --browseroption=/phan
ionic serve --browseroption=/phan/1234

--- PROD
ionic build --prod
firebase deploy --only hosting:giapha