# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Sequential Thinking Enhanced seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:
- Open a public GitHub issue
- Post about it on social media
- Exploit the vulnerability

### Please DO:
1. Email us at: [Create a security contact email or use GitHub Security Advisories]
2. Include the following information:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue

### What to expect:
- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a more detailed response within 7 days
- We will work on a fix and coordinate the release with you
- We will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)

## Security Considerations

### MCP Server Security
This tool runs as an MCP server with access to:
- File system operations (read/write handoff files)
- Process communication with Claude Desktop
- No network access required

### Best Practices:
1. **config.json**: Never commit sensitive information in your config.json
2. **Handoff files**: Be careful sharing handoff files as they contain your full thinking history
3. **File permissions**: Ensure proper file permissions on config.json and handoff files
4. **Updates**: Keep the tool updated to receive security patches

### Known Limitations:
- The tool stores thought history in memory and handoff files
- No encryption is applied to handoff files
- No authentication between the MCP server and Claude Desktop

## Dependencies

We regularly update our dependencies to include security patches. You can check for vulnerabilities using:

```bash
npm audit
```

To update dependencies:
```bash
npm update
npm audit fix
```

## Contact

For security concerns that should not be public, please use GitHub's private security advisory feature or contact the maintainers directly through the repository.
