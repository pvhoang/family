
echo off
echo ---
localhost:8100/auv
pause
pause
start 
pause

@REM ionic serve --browseroption=/phan
@REM ionic serve --browseroption=/aedit


ionic build --prod
firebase deploy --only hosting:giapha

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