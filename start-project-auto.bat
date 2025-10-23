@echo off
title Mini Project - Auto Start

REM -------------------------
REM Backend Setup & Start
REM -------------------------
cd /d C:\Users\Admin\Desktop\Mini Project\backend
echo Installing backend dependencies (if missing)...
npm install
echo Starting backend server...
start cmd /k "cd /d C:\Users\Admin\OneDrive\Desktop\Mini Project\backend && npm run dev"

REM -------------------------
REM Frontend Setup & Start
REM -------------------------
cd /d C:\Users\Admin\Desktop\Mini Project\frontend
echo Installing frontend dependencies (if missing)...
npm install
echo Starting frontend server...
start cmd /k "cd /d C:\Users\Admin\OneDrive\Desktop\Mini Project\frontend && npm run dev"

echo All servers are starting automatically...
exit
