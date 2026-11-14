@echo off
title BH Key Distribuidora - site
cd /d "%~dp0"

if not exist "dist\index.html" (
  echo.
  echo  [ERRO] dist\index.html nao encontrado.
  echo  Rode primeiro:  npm install   e   npm run build
  echo.
  pause
  exit /b 1
)

if /i "%~1"=="serve" goto serve

echo Abrindo o site direto da pasta dist\ ...
rem PowerShell abre caminhos UTF-8 sem depender do codepage do console
powershell -NoProfile -Command "Start-Process -FilePath '%~dp0dist\index.html'"
exit /b 0

:serve
echo Subindo servidor local em http://localhost:4173 ...
node scripts\serve.mjs
pause
exit /b 0
