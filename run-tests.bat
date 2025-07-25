@echo off
echo =================================================
echo Enhanced Sequential Thinking Server - Test Suite
echo =================================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js first
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo Running test suite...
echo.

REM Test 1: Unit tests (no server required)
echo [1/3] Running unit tests...
echo =============================
node test-unit.js
if %errorlevel% neq 0 (
    echo.
    echo Unit tests FAILED!
    set FAILED=1
) else (
    echo Unit tests PASSED!
    set PASSED_UNIT=1
)

echo.
echo [2/3] Running server integration tests...
echo =========================================
node test-server.js
if %errorlevel% neq 0 (
    echo.
    echo Server tests FAILED!
    set FAILED=1
) else (
    echo Server tests PASSED!
    set PASSED_SERVER=1
)

echo.
echo [3/3] Manual testing available...
echo =================================
echo.
echo For interactive testing, run:
echo   node test-interactive.js
echo.
echo This allows you to:
echo - Manually test each command
echo - See the server responses
echo - Run a demo sequence
echo - Test edge cases interactively
echo.

if defined FAILED (
    echo =================================================
    echo WARNING: Some tests failed!
    echo Please check the errors above before using.
    echo =================================================
) else (
    echo =================================================
    echo SUCCESS: All automated tests passed!
    echo =================================================
    echo.
    echo The server is ready to add to Claude Desktop.
    echo.
    echo Add this to your claude_desktop_config.json:
    echo.
    echo   "sequential-thinking-enhanced": {
    echo     "command": "node",
    echo     "args": ["%CD%\\index.js"]
    echo   }
    echo.
)

pause
