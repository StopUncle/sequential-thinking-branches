@echo off
echo ========================================
echo Enhanced Sequential Thinking Server
echo First Run Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
echo ---------------------------------
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Running pre-flight check...
echo -----------------------------------
node preflight-check.js
if %errorlevel% neq 0 (
    echo.
    echo Please fix the issues above and run this again.
    pause
    exit /b 1
)

echo.
echo Step 3: Running basic tests...
echo ------------------------------
node test-unit.js
if %errorlevel% neq 0 (
    echo.
    echo Basic tests failed! Please check the implementation.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Customize your project knowledge:
echo    Edit config.json with your project details
echo.
echo 2. Test interactively:
echo    node test-interactive.js
echo.
echo 3. Add to Claude Desktop (copy the config above)
echo.
echo 4. Restart Claude Desktop and test!
echo.
pause
