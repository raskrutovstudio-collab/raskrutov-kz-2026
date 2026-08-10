@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0diagnose-parallel-work.ps1"
exit /b %ERRORLEVEL%
