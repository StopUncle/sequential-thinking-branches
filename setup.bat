@echo off
echo Enhanced Sequential Thinking Setup
echo ==================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✓ Dependencies installed successfully
echo.
echo Next steps:
echo 1. Add this to your Claude Desktop config:
echo.
echo    "sequential-thinking-enhanced": {
echo      "command": "node",
echo      "args": ["%CD%\\index.js"]
echo    }
echo.
echo 2. Customize config.json with your project details
echo.
echo 3. Restart Claude Desktop
echo.
echo 4. Start using enhanced sequential thinking!
echo.
pause
