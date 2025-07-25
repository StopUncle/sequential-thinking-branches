#!/bin/bash

echo "================================================"
echo "  Sequential Thinking Enhanced - Setup"
echo "================================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org"
    exit 1
fi

# Check Node.js version
echo "[1/4] Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}ERROR: Node.js version is too old. Please upgrade to v18 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}OK - Node.js version is compatible${NC}"

# Install dependencies
echo
echo "[2/4] Installing dependencies..."
if npm install; then
    echo -e "${GREEN}OK - Dependencies installed${NC}"
else
    echo -e "${RED}ERROR: Failed to install dependencies${NC}"
    exit 1
fi

# Setup configuration
echo
echo "[3/4] Setting up configuration..."
if [ ! -f config.json ]; then
    cp config.example.json config.json
    echo -e "${GREEN}OK - Created config.json from example${NC}"
    echo
    echo -e "${YELLOW}IMPORTANT: Please edit config.json to add your project details!${NC}"
else
    echo -e "${GREEN}OK - config.json already exists${NC}"
fi

# Run setup script
echo
echo "[4/4] Running setup script..."
node setup.js

echo
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo
echo "Next steps:"
echo "1. Edit config.json with your project details"
echo "2. Restart Claude Desktop"
echo "3. Start using the tool with [main:1] in Claude"
echo
echo "For help, see README.md or QUICKSTART.md"
echo

# Make the script executable
chmod +x "$0"
