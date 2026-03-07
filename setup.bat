@echo off
REM CVEarity - Windows setup script

echo CVEarity - Initializing development environment...
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo = Setup complete! =
echo.
echo To start the development environment:
echo.
echo 1. Start backend (in terminal 1):
echo    cd backend ^&^& npm start
echo.
echo 2. Start frontend (in terminal 2):
echo    cd frontend ^&^& npm run dev
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
