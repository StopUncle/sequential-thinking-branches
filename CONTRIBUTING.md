# Contributing to Sequential Thinking Enhanced

Thank you for your interest in contributing to Sequential Thinking Enhanced! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Git
- A text editor (VS Code recommended)
- Claude Desktop (for testing)

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sequential-thinking-branches.git
   cd sequential-thinking-branches
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔧 Development Workflow

### Running Tests
```bash
# Run all tests
npm test

# Run unit tests only
node test-unit.js

# Run interactive tests
node test-interactive.js

# Test with a local Claude instance
node test-server.js
```

### Debugging
```bash
# Run with debug logging
DISABLE_THOUGHT_LOGGING=false node index.js

# Run troubleshooting script
node troubleshoot.js

# Validate configuration
node validate.js
```

## 📝 Making Changes

### Code Style
- Use ES6+ features
- Follow existing code patterns
- Add JSDoc comments for new functions
- Keep functions focused and small

### Commit Messages
Follow conventional commits format:
```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

Example:
```
feat(branch): add auto-merge for resolved branches

Automatically merge branches when all thoughts are marked as resolved.
This helps keep the thought tree clean and focused.

Closes #123
```

### Testing Your Changes
1. Test basic functionality:
   ```bash
   node test.js
   ```

2. Test with Claude Desktop:
   - Update your Claude config to point to your local version
   - Test all modified features
   - Try edge cases

3. Ensure backward compatibility:
   - Original `sequentialthinking` command should work unchanged
   - Test handoff/resume with files from older versions

## 🎯 What to Work On

### Good First Issues
- Documentation improvements
- Add more examples
- Improve error messages
- Add input validation

### Feature Ideas
- Visual thought tree viewer
- Export to different formats (Markdown, JSON, Mermaid)
- Integration with other MCP tools
- Performance optimizations
- Additional branch management commands

### Current Priorities
1. Improve error handling and recovery
2. Add more project knowledge templates
3. Create a web-based thought visualizer
4. Add branch comparison features

## 📤 Submitting Changes

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new features
4. Update CHANGELOG.md
5. Submit PR with clear description

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Tested with Claude Desktop
- [ ] Added new tests

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🏗️ Architecture

### Key Components

1. **EnhancedSequentialThinkingServer**
   - Main server class
   - Manages thought state
   - Handles branching logic

2. **State Management**
   ```javascript
   thoughtState = {
     main: [],           // Main track thoughts
     branches: {},       // Branch information
     currentTrack: '',   // Active track
     currentNumber: 0    // Current thought number
   }
   ```

3. **Tool Handlers**
   - `sequentialthinking` - Main thinking tool
   - `sequentialthinking_branch` - Create branches
   - `sequentialthinking_merge` - Merge branches
   - `sequentialthinking_handoff` - Save state
   - `sequentialthinking_resume` - Restore state

### Adding New Features

1. **New Tool**: Add to tool definitions and handler
2. **New Knowledge Type**: Update `injectProjectKnowledge`
3. **New Branch Feature**: Extend branch management methods

## 🐛 Reporting Issues

### Bug Reports Should Include
- Node.js version
- Claude Desktop version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs
- Handoff file (if relevant)

### Feature Requests Should Include
- Use case description
- Why existing features don't work
- Proposed solution (optional)
- Examples of usage

## 📚 Resources

- [MCP Documentation](https://github.com/modelcontextprotocol/specification)
- [Original Sequential Thinking Server](https://github.com/modelcontextprotocol/servers)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## ❓ Questions?

- Check existing [issues](https://github.com/StopUncleTonyFromComing/sequential-thinking-branches/issues)
- Start a [discussion](https://github.com/StopUncleTonyFromComing/sequential-thinking-branches/discussions)
- Review the [README](README.md) and examples

Thank you for contributing! 🎉
