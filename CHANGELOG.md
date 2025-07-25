# Changelog

All notable changes to Sequential Thinking Enhanced will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-25

### 🎉 Initial Public Release

This is the first public release of Sequential Thinking Enhanced, an enhancement to Anthropic's Sequential Thinking MCP server.

### Added
- **Branching System** - Create and merge thought branches for investigating side issues
- **Self-Reinforcing Output** - Every response includes continuation hints to prevent dropping
- **Handoff/Resume** - Save and restore entire thinking sessions across conversations
- **Project Knowledge** - Configure and auto-inject project-specific context
- **Backward Compatibility** - Fully compatible with original sequential thinking tool
- **Comprehensive Tests** - Unit tests, integration tests, and interactive testing
- **Setup Script** - Automated installation and configuration
- **Documentation** - Complete README, CONTRIBUTING guide, and examples

### Features in Detail

#### 🌿 Branching
- Create branches with `[branch: name]` to investigate errors or test hypotheses
- Merge branches back with `[merge: name]` including all thoughts
- Track multiple active branches simultaneously
- Clear branch markers in thought history

#### 🔄 Self-Reinforcing Output
- Footer on every response shows next thought position
- Lists active branches to maintain context
- Prevents common issue of Claude forgetting to continue

#### 📦 Handoff/Resume
- Generate comprehensive markdown handoff files
- Include all thoughts, branches, and project knowledge
- Resume with full state restoration
- Perfect for long debugging sessions

#### 🧠 Project Knowledge
- Configure in `config.json` with your project details
- Auto-detects keywords and injects relevant context
- Supports database, auth, framework, and custom categories
- Reduces need to re-explain project structure

### Technical Details
- Built with MCP SDK 0.5.0
- Requires Node.js >= 18.0.0
- ES Modules support
- Cross-platform (Windows, macOS, Linux)

### Credits
- Built on top of [@modelcontextprotocol/server-sequential-thinking](https://github.com/modelcontextprotocol/servers)
- Enhanced by the AutonomousEmpire team

## [Unreleased]

### Planned Features
- Visual thought tree viewer
- Export to different formats (Mermaid diagrams)
- Branch comparison and diff views
- Integration with other MCP tools
- Performance optimizations for large thought trees
- Web-based thought visualizer

---

For more details on each release, see the [GitHub Releases](https://github.com/StopUncleTonyFromComing/sequential-thinking-branches/releases) page.
