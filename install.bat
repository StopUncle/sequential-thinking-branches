@echo off
echo ================================================
echo   Sequential Thinking Enhanced - Windows Setup
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18 or higher from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Checking Node.js version...
for /f "tokens=1,2 delims=v." %%a in ('node --version') do (
    if %%b lss 18 (
        echo ERROR: Node.js version is too old. Please upgrade to v18 or higher.
        pause
        exit /b 1
    )
)
echo OK - Node.js version is compatible

echo.
echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo OK - Dependencies installed

echo.
echo [3/4] Setting up configuration...
if not exist config.json (
    copy config.example.json config.json >nul
    echo OK - Created config.json from example
    echo.
    echo IMPORTANT: Please edit config.json to add your project details!
) else (
    echo OK - config.json already exists
)

echo.
echo [4/4] Running setup script...
node setup.js

echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Edit config.json with your project details
echo 2. Restart Claude Desktop
echo 3. Start using the tool with [main:1] in Claude
echo.
echo For help, see README.md or QUICKSTART.md
echo.
pause
