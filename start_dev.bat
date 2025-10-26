@echo off
ECHO Starting Development Environment...

start "Development Server" cmd.exe /k "npm run dev"
timeout /t 3 /nobreak
start chrome "http://localhost:3000"

ECHO Done! The server is running and the browser is open.
PAUSE