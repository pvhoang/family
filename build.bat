
echo off
echo ---
start localhost:8100/auv
pause
start ionic build --prod
pause
start firebase deploy --only hosting:giapha
pause





