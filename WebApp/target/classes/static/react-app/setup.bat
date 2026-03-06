@echo off
echo Installing obfuscation dependencies...
cd /d "%~dp0"
call npm install
echo.
echo Setup complete! Run 'npm run build' to obfuscate and build.
pause
