
echo off
echo ---
localhost:8100/auv
pause
ionic build --prod
pause
start firebase deploy --only hosting:giapha
pause





