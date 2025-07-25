#!/usr/bin/env node

// Troubleshooting helper for Enhanced Sequential Thinking Server
// Run when you encounter issues

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(chalk.cyan('🔧 Troubleshooting Enhanced Sequential Thinking Server\n'));

// Common issues and solutions
const issues = {
  'Tool not appearing in Claude': {
    checks: [
      {
        name: 'Server in MCP config',
        test: () => {
          // This is just informational
          console.log(chalk.yellow('\nCheck your claude_desktop_config.json includes:'));
          console.log(chalk.gray(JSON.stringify({
            "sequential-thinking-enhanced": {
              "command": "node",
              "args": [join(__dirname, 'index.js')]
            }
          }, null, 2)));
          return true;
        }
      },
      {
        name: 'Claude Desktop restarted',
        test: () => {
          console.log(chalk.yellow('\nMake sure you\'ve restarted Claude Desktop after adding the config'));
          return true;
        }
      }
    ]
  },
  
  'Server fails to start': {
    checks: [
      {
        name: 'Node.js version',
        test: () => {
          const version = process.version;
          const major = parseInt(version.split('.')[0].substring(1));
          console.log(`Node.js version: ${version}`);
          return major >= 16;
        },
        fix: 'Update Node.js to version 16 or higher'
      },
      {
        name: 'Dependencies installed',
        test: () => existsSync(join(__dirname, 'node_modules')),
        fix: 'Run: npm install'
      },
      {
        name: 'No syntax errors',
        test: () => {
          try {
            execSync('node -c index.js', { cwd: __dirname });
            return true;
          } catch (e) {
            return false;
          }
        },
        fix: 'Check index.js for syntax errors'
      }
    ]
  },
  
  'Handoff/Resume not working': {
    checks: [
      {
        name: 'Write permissions',
        test: () => {
          try {
            const testFile = join(process.cwd(), 'test-write.tmp');
            require('fs').writeFileSync(testFile, 'test');
            require('fs').unlinkSync(testFile);
            return true;
          } catch (e) {
            return false;
          }
        },
        fix: 'Check write permissions in current directory'
      },
      {
        name: 'Working directory',
        test: () => {
          console.log(`Current working directory: ${process.cwd()}`);
          return true;
        }
      }
    ]
  },
  
  'Project knowledge not showing': {
    checks: [
      {
        name: 'config.json or config.example.json exists',
        test: () => existsSync(join(__dirname, 'config.json')) || existsSync(join(__dirname, 'config.example.json')),
        fix: 'Create config.json from config.example.json'
      },
      {
        name: 'Valid JSON',
        test: () => {
          try {
            const configPath = existsSync(join(__dirname, 'config.json')) 
              ? join(__dirname, 'config.json')
              : join(__dirname, 'config.example.json');
            JSON.parse(readFileSync(configPath, 'utf-8'));
            return true;
          } catch (e) {
            return false;
          }
        },
        fix: 'Fix JSON syntax in config file'
      },
      {
        name: 'projectKnowledge configured',
        test: () => {
          try {
            const configPath = existsSync(join(__dirname, 'config.json')) 
              ? join(__dirname, 'config.json')
              : join(__dirname, 'config.example.json');
            const config = JSON.parse(readFileSync(configPath, 'utf-8'));
            return !!config.projectKnowledge;
          } catch (e) {
            return false;
          }
        },
        fix: 'Add projectKnowledge section to config file'
      }
    ]
  }
};

// Run diagnostics
console.log(chalk.yellow('Running diagnostics...\n'));

// Check which issue the user is having
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node troubleshoot.js <issue>\n');
  console.log('Available issues:');
  Object.keys(issues).forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  console.log('\nExample: node troubleshoot.js 1');
  process.exit(0);
}

const issueIndex = parseInt(args[0]) - 1;
const issueKeys = Object.keys(issues);

if (issueIndex < 0 || issueIndex >= issueKeys.length) {
  console.log(chalk.red('Invalid issue number'));
  process.exit(1);
}

const selectedIssue = issueKeys[issueIndex];
const checks = issues[selectedIssue].checks;

console.log(chalk.cyan(`Troubleshooting: ${selectedIssue}\n`));

let failed = false;
checks.forEach(check => {
  try {
    const result = check.test();
    if (result) {
      console.log(chalk.green(`✅ ${check.name}`));
    } else {
      console.log(chalk.red(`❌ ${check.name}`));
      if (check.fix) {
        console.log(chalk.yellow(`   Fix: ${check.fix}`));
      }
      failed = true;
    }
  } catch (e) {
    console.log(chalk.red(`❌ ${check.name}: ${e.message}`));
    if (check.fix) {
      console.log(chalk.yellow(`   Fix: ${check.fix}`));
    }
    failed = true;
  }
});

// Additional diagnostics
console.log(chalk.yellow('\n📊 Additional Information:'));
console.log(`Platform: ${process.platform}`);
console.log(`Node path: ${process.execPath}`);
console.log(`Script directory: ${__dirname}`);

// Check for common error patterns in server output
console.log(chalk.yellow('\n🔍 Quick server test:'));
const { spawn } = await import('child_process');
const testServer = spawn('node', ['index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errors = '';

testServer.stdout.on('data', (data) => {
  output += data.toString();
});

testServer.stderr.on('data', (data) => {
  errors += data.toString();
});

setTimeout(() => {
  testServer.kill();
  
  if (errors.includes('Enhanced Sequential Thinking MCP Server running')) {
    console.log(chalk.green('✅ Server starts successfully'));
  } else {
    console.log(chalk.red('❌ Server failed to start properly'));
    if (errors) {
      console.log(chalk.red('Errors:'));
      console.log(errors);
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  if (!failed) {
    console.log(chalk.green('\n✨ No issues found!'));
    console.log('\nIf the problem persists:');
    console.log('1. Check Claude Desktop developer console for errors');
    console.log('2. Try the interactive test: node test-interactive.js');
    console.log('3. Enable debug logging: set DISABLE_THOUGHT_LOGGING=false');
  } else {
    console.log(chalk.yellow('\n⚠️  Issues found - please address the fixes above'));
  }
  
  process.exit(failed ? 1 : 0);
}, 2000);
