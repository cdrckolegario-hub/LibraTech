@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed. Please check your Node.js/npm installation or network connection.
    pause
    exit /b 1
  )
)
echo Starting LibraTech...
call npm start
pause
