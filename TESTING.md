# Testing Guide - Enhanced Sequential Thinking Server

## Quick Start

Run all tests with one command:
```bash
run-tests.bat
```

## Testing Options

### 1. Pre-flight Check (Recommended First Step)
```bash
node preflight-check.js
```
- Verifies all files are present
- Checks dependencies are installed
- Validates configuration
- Tests if server can start
- Provides exact config snippet for Claude Desktop

### 2. Unit Tests (No Server Required)
```bash
node test-unit.js
```
- Tests core logic without starting server
- Validates branching logic
- Checks state management
- Very fast (~1 second)

### 3. Integration Tests (Full MCP Protocol)
```bash
node test-server.js
```
- Starts actual server
- Tests MCP protocol communication
- Validates all tools work correctly
- Tests error handling
- Takes ~10-15 seconds

Add `--debug` flag for verbose output:
```bash
node test-server.js --debug
```

### 4. Interactive Testing
```bash
node test-interactive.js
```
- Manual testing interface
- Test individual commands
- See real-time responses
- Run demo sequences

Commands available:
- `init` - Initialize MCP connection
- `list` - List all tools
- `think <text>` - Add a thought
- `branch <name>` - Create branch
- `merge <name>` - Merge branch
- `handoff` - Generate handoff
- `resume <file>` - Resume from handoff
- `demo` - Run full demo sequence
- `help` - Show commands
- `exit` - Quit

### 5. Simple Validation
```bash
node validate.js
```
- Basic file validation
- Checks imports work
- Quick sanity check

## Test Scenarios

### Basic Workflow Test
1. Start interactive test: `node test-interactive.js`
2. Run these commands:
```
init
think Starting to debug the issue
think Found an error in logs
branch error-investigation
think Checking error details
think Found the root cause
merge error-investigation
think Applying the fix
handoff
```

### Edge Case Testing
Test these scenarios in interactive mode:

1. **Duplicate branch names**:
```
branch test
branch test  # Should error
```

2. **Merge non-existent branch**:
```
merge does-not-exist  # Should error with suggestions
```

3. **Resume from handoff**:
```
handoff  # Note the filename
exit
# Restart and run:
init
resume handoff-[timestamp].md
```

## Common Issues

### "npm is not installed"
- Install Node.js from https://nodejs.org/

### "Cannot find module"
- Run `npm install` in the enhanced directory

### "Server fails to start"
- Check if another process is using stdio
- Verify Node.js version is 16+
- Check error messages in test output

### "Tests fail on Windows"
- Ensure you're using `run-tests.bat` not `.sh`
- Check paths use backslashes in config

## Testing Checklist

Before adding to Claude Desktop:

- [ ] Run `node preflight-check.js` - all green
- [ ] Run `run-tests.bat` - all tests pass
- [ ] Try interactive demo: `node test-interactive.js` then `demo`
- [ ] Customize `config.json` with your project details
- [ ] Test handoff/resume works correctly

## What Each Test Validates

### Unit Tests
- ✓ Initial state configuration
- ✓ Thought processing and storage
- ✓ Branch creation and switching
- ✓ Branch merging with markers
- ✓ Duplicate branch prevention
- ✓ Non-existent branch handling
- ✓ Active branch tracking
- ✓ Input validation
- ✓ Auto-adjustment of totals

### Integration Tests
- ✓ MCP protocol handshake
- ✓ Tool listing and discovery
- ✓ Sequential thinking tool
- ✓ Branch operations
- ✓ Merge operations
- ✓ Handoff generation
- ✓ Resume from handoff
- ✓ Error responses
- ✓ Project knowledge injection
- ✓ Self-reinforcing output

### Interactive Tests
- ✓ Real-time response handling
- ✓ State persistence across commands
- ✓ Visual output formatting
- ✓ Demo workflow execution

## Performance Expectations

- Server startup: ~500ms
- Tool response: <50ms
- Handoff generation: <100ms
- Memory usage: ~30-50MB

## Next Steps

Once all tests pass:

1. Copy the config snippet from `preflight-check.js`
2. Add to your `claude_desktop_config.json`
3. Restart Claude Desktop
4. Test in Claude with: "Let's use sequential thinking to debug an issue"

The self-reinforcing output should keep Claude using the tool throughout the conversation!
