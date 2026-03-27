@echo off
title ZappNews.ai Server
cd /d %~dp0..
echo Starting ZappNews.ai...
echo.
echo Server will run at http://localhost:3000
echo Press Ctrl+C to stop
echo.
node dist/index.js
pause
