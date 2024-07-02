
echo off
echo ---
localhost:8100/auv
pause
pause
start 
pause

ionic serve --browseroption=/phan
ionic serve --browseroption=/aedit
ionic build --prod
firebase deploy --only hosting:giapha

