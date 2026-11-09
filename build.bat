@echo off
cd /d "%~dp0"
echo Generando build de produccion de BetIQ...
npm run build
pause

