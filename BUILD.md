=====================================================================
# USAGE
=====================================================================
--- BATCH ---
echo off
echo ---
localhost:8100/auv
pause
start 
pause
@REM ionic serve --browseroption=/phan

--- TEXT ICONS ---
https://coolsymbol.com/

--- VS Shortkeys ---

Fold/Unfold JSON
https://stackoverflow.com/questions/30067767/how-do-i-fold-collapse-hide-sections-of-code-in-visual-studio-code

=====================================================================
# DEVELOPMENT
=====================================================================

## EMULATOR
cd d:/dev/family/emulator/
firebase emulators:start --import=./firebaseExport --export-on-exit=./firebaseExport
http://localhost:4000/

## FIREBASE MESSAGING - FUNCTION CHANGE
cd d:/dev/family/emulator/
firebase deploy --only functions:pushMessages_phan

## APP
cd d:/dev/family/
ionic serve
ionic serve --browseroption=/debug/APP,SEARCH
ionic serve --browseroption=/1234/debug/FILER
http://localhost:8100/

=====================================================================
# PRODUCTION
=====================================================================

@REM firebase deploy --only hosting:giapha
@REM firebase target:apply hosting giaphahophan giaphahophan
ionic build --prod
firebase deploy --only hosting:giaphahophan
## APP
https://giaphahophan.web.app
https://giaphahophan.web.app/1234

