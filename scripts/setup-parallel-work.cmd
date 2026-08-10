@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-parallel-work.ps1" %*
exit /b %ERRORLEVEL%
