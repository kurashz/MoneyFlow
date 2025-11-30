@echo off
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo Starting frontend server...
npm run dev
pause



