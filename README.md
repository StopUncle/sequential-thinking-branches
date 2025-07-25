# 🌿 Sequential Thinking Enhanced

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Version](https://img.shields.io/badge/MCP-0.5.0-blue)](https://github.com/modelcontextprotocol)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org)

An enhanced version of Anthropic's Sequential Thinking MCP server that adds branching capabilities, self-reinforcing output, handoff/resume functionality, and project knowledge integration.

## 🎯 The Problem It Solves

When debugging complex issues, you often need to investigate side paths without losing your main train of thought. The original sequential thinking tool forces linear progression. Our enhancement lets you branch off, investigate, and merge findings back - just like Git branches but for thoughts.

## ✨ Key Features

### 🌿 **Branching System**
Create branches to investigate side issues without losing your main train of thought:
- Branch off at any point to explore errors, test hypotheses, or investigate tangents
- Merge branches back to main with clear markers
- Track multiple active branches simultaneously

### 🔄 **Self-Reinforcing Output**
Never lose track of the tool again! Every response includes:
```
---
Continue from: [main:6]
Active branches: database-debug, error-investigation
---
```

### 📦 **Handoff/Resume**
- Generate comprehensive handoff documents with all thoughts and state
- Resume sessions with full context preservation
- Perfect for long debugging sessions across multiple conversations

### 🧠 **Project Knowledge**
Configure project-specific knowledge that gets auto-injected when relevant:
- Database connections
- Framework details
- Common issues and solutions

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Claude Desktop with MCP support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/StopUncleTonyFromComing/sequential-thinking-branches.git
cd sequential-thinking-branches
```

2. Install dependencies:
```bash
npm install
```

3. Add to your Claude Desktop configuration:

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

4. Restart Claude Desktop

## 📖 Usage Examples

### Basic Sequential Thinking (Backward Compatible)
```
[main:1] Starting to debug the authentication issue
[main:2] Looking at the login endpoint
[main:3] Found an issue with JWT validation
```

### Creating and Using Branches
```
[main:5] Found a database connection error
[branch: database-debug]
[database-debug:1] Checking connection string
[database-debug:2] Testing with direct query
[database-debug:3] Connection works, issue is with ORM
[merge: database-debug]
[main:6] Database issue resolved (ORM config), continuing with auth debug
```

### Handoff and Resume
Before ending a session:
```
[handoff]
> Generated: handoff-2025-07-25T10-30-00.md
> Contains 15 main thoughts, 3 branches, project knowledge
```

In a new conversation:
```
[resume: handoff-2025-07-25T10-30-00.md]
> Restored 15 main thoughts, 3 branches
> Current position: [main:15]
[main:16] Continuing where we left off...
```

## 🔧 Configuration

### Project Knowledge Setup

Edit `config.json` to add your project-specific information:

```json
{
  "projectKnowledge": {
    "database": "PostgreSQL on localhost:5432, DB: myapp",
    "framework": "FastAPI with SQLAlchemy",
    "auth": "JWT tokens with 24-hour expiry",
    "key_endpoints": [
      "/api/auth/login - User authentication",
      "/api/users - User management"
    ],
    "common_issues": {
      "connection_timeout": "Check VPN connection and database firewall rules",
      "auth_failures": "Verify JWT secret in environment variables"
    }
  }
}
```

The tool automatically detects keywords and injects relevant knowledge:
- Mention "database" → get connection details
- Mention "auth" → get authentication setup info
- Mention "endpoint" → get API route documentation

## 📊 Comparison with Original

| Feature | Original | Enhanced |
|---------|----------|----------|
| Sequential thinking | ✅ | ✅ |
| Revisions | ✅ | ✅ |
| **Branching** | ❌ | ✅ |
| **Self-reinforcing output** | ❌ | ✅ |
| **Handoff/Resume** | ❌ | ✅ |
| **Project knowledge** | ❌ | ✅ |
| **Prevents dropping** | ❌ | ✅ |

## 🎓 Best Practices

### When to Branch
**Branch when:**
- You need to investigate an error that might take multiple steps
- You want to test something that might not work
- You're checking a tangential concern
- You don't want to clutter the main thought sequence

**Continue on main when:**
- The investigation is directly related to your main goal
- It's a quick check (1-2 thoughts)
- You've confirmed the issue and are implementing the fix

### Branch Naming Conventions
- `error-investigation` - For debugging specific errors
- `test-hypothesis` - For testing theories
- `check-config` - For configuration verification
- `perf-analysis` - For performance investigation

## 🐛 Troubleshooting

### Tool Not Appearing in Claude
1. Check MCP server is properly configured
2. Restart Claude Desktop
3. Check server logs in Claude's developer console

### Branches Not Merging
- Ensure branch name is spelled correctly (case-sensitive)
- Check if branch was already merged
- Use the exact branch name from creation

### Handoff File Not Found
- Ensure you're using the exact filename provided
- Check file exists in the server directory
- Verify file permissions

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
# Clone the repo
git clone https://github.com/StopUncleTonyFromComing/sequential-thinking-branches.git
cd sequential-thinking-branches

# Install dependencies
npm install

# Run tests
npm test

# Run with debug logging
DISABLE_THOUGHT_LOGGING=false node index.js
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Built on top of [@modelcontextprotocol/server-sequential-thinking](https://github.com/modelcontextprotocol/servers) by Anthropic
- Enhanced with branching and persistence features for complex debugging workflows

## 📬 Support

- **Issues**: [GitHub Issues](https://github.com/StopUncleTonyFromComing/sequential-thinking-branches/issues)
- **Discussions**: [GitHub Discussions](https://github.com/StopUncleTonyFromComing/sequential-thinking-branches/discussions)

---

**Note**: This is an unofficial enhancement of the original Sequential Thinking MCP server. It maintains full backward compatibility while adding powerful new features for complex debugging workflows.
