
echo off
echo ---
start ionic build --prod
pause
start firebase deploy --only hosting:giapha
pause



