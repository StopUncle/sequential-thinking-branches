# Quick Start Guide

Get up and running with Sequential Thinking Enhanced in under 5 minutes!

## 🚀 Installation

### Option 1: Quick Install (Recommended)

**Windows:**
```bash
git clone https://github.com/StopUncleTonyFromComing/sequential-thinking-branches.git
cd sequential-thinking-branches
install.bat
```

**macOS/Linux:**
```bash
git clone https://github.com/StopUncleTonyFromComing/sequential-thinking-branches.git
cd sequential-thinking-branches
./install.sh
```

### Option 2: Manual Install

1. **Clone the repository:**
```bash
git clone https://github.com/StopUncleTonyFromComing/sequential-thinking-branches.git
cd sequential-thinking-branches
```

2. **Install dependencies:**
```bash
npm install
```

3. **Copy the example config:**
```bash
cp config.example.json config.json
```

## 🔧 Configure Claude Desktop

Add to your Claude Desktop config file:

**Windows** (`%APPDATA%\Claude\claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "sequential-thinking-enhanced": {
      "command": "node",
      "args": ["C:\\path\\to\\sequential-thinking-branches\\index.js"]
    }
  }
}
```

**macOS** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "sequential-thinking-enhanced": {
      "command": "node",
      "args": ["/path/to/sequential-thinking-branches/index.js"]
    }
  }
}
```

## 🎯 Test It!

1. **Restart Claude Desktop**

2. **Start a new conversation and type:**
```
Let's debug an issue using sequential thinking.

[main:1] Starting to investigate the login timeout issue
```

3. **Claude should respond with the enhanced format:**
```
✓ Successfully processed thought
{
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "track": "main",
  "nextThoughtNeeded": true
}

---
Continue from: [main:2]
No active branches
---
```

## 📝 Basic Usage

### Linear Thinking (Backward Compatible)
```
[main:1] Analyzing the authentication flow
[main:2] Checking JWT validation
[main:3] Found issue with token expiry
```

### Creating a Branch
```
[main:3] Found a database timeout error
[branch: investigate-db]
[investigate-db:1] Checking connection string
[investigate-db:2] Testing direct connection
```

### Merging a Branch
```
[merge: investigate-db]
[main:4] Database is fine, continuing with auth debug
```

### Saving Your Work
```
[handoff]
> Generated: handoff-2025-07-25T10-30-00.md
```

### Resuming Later
```
[resume: handoff-2025-07-25T10-30-00.md]
> Restored 15 thoughts and 2 branches
[main:16] Continuing where we left off...
```

## 🧠 Configure Project Knowledge

Edit `config.json` to add your project details:

```json
{
  "projectKnowledge": {
    "database": "PostgreSQL on localhost:5432",
    "framework": "Express.js with TypeScript",
    "auth": "JWT with refresh tokens",
    "key_endpoints": [
      "/api/auth/login - User login",
      "/api/auth/refresh - Token refresh"
    ]
  }
}
```

Now when you mention "database" or "auth", relevant details appear automatically!

## 🎨 Real Example

```
[main:1] Users report login failures after 5 minutes

[branch: check-jwt-expiry]
[check-jwt-expiry:1] Looking at JWT token configuration
[check-jwt-expiry:2] Access token expires in 5 minutes
[check-jwt-expiry:3] But refresh token logic is broken!

[merge: check-jwt-expiry]

[main:2] Issue found: Refresh token endpoint returns 404
[main:3] Implementing proper refresh token handler
[main:4] Testing with extended session
[main:5] Success! Users stay logged in properly

[handoff]
> Saved complete debugging session
```

## 🆘 Troubleshooting

### "Tool not found" in Claude
1. Check your Claude Desktop config path is correct
2. Restart Claude Desktop completely
3. Run `node validate.js` to check setup

### "Cannot find module" error
1. Run `npm install` in the project directory
2. Make sure you're using Node.js 18 or higher
3. Check that all files were cloned properly

### Branch won't merge
- Branch names are case-sensitive
- Check the branch exists: it should appear in "Active branches"
- Make sure you haven't already merged it

## 📚 Next Steps

- Read the [full documentation](README.md)
- Check out [advanced examples](DEMO.md)
- Configure your [project knowledge](config.example.json)
- Join the [discussions](https://github.com/StopUncleTonyFromComing/sequential-thinking-branches/discussions)

## 💡 Pro Tips

1. **Branch early and often** - Don't wait until you're deep in investigation
2. **Use descriptive branch names** - `fix-auth` is better than `branch1`
3. **Merge as soon as done** - Keep your branch list clean
4. **Handoff before long breaks** - Save your entire thought process
5. **Add project knowledge** - Reduce repetitive context setting

Happy debugging! 🚀
