#!/usr/bin/env node

// Pre-flight check for Enhanced Sequential Thinking Server
// Run this before adding to Claude Desktop config

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(chalk.cyan('🚀 Pre-flight Check - Enhanced Sequential Thinking\n'));

let issues = 0;

function check(name, condition, fix) {
  if (condition) {
    console.log(chalk.green(`✅ ${name}`));
  } else {
    console.log(chalk.red(`❌ ${name}`));
    if (fix) {
      console.log(chalk.yellow(`   Fix: ${fix}`));
    }
    issues++;
  }
}

// Check 1: Required files exist
console.log(chalk.yellow('\n📁 Checking files:'));
check('index.js exists', existsSync(join(__dirname, 'index.js')));
check('package.json exists', existsSync(join(__dirname, 'package.json')));
const configExists = existsSync(join(__dirname, 'config.json'));
const configExampleExists = existsSync(join(__dirname, 'config.example.json'));
check('config.json or config.example.json exists', configExists || configExampleExists, 
  configExists ? null : 'Copy config.example.json to config.json');

// Check 2: Dependencies installed
console.log(chalk.yellow('\n📦 Checking dependencies:'));
check('node_modules exists', existsSync(join(__dirname, 'node_modules')), 'Run: npm install');
check('@modelcontextprotocol/sdk installed', 
  existsSync(join(__dirname, 'node_modules', '@modelcontextprotocol', 'sdk')), 
  'Run: npm install');
check('chalk installed', 
  existsSync(join(__dirname, 'node_modules', 'chalk')), 
  'Run: npm install');

// Check 3: Configuration
console.log(chalk.yellow('\n⚙️  Checking configuration:'));
try {
  const configPath = existsSync(join(__dirname, 'config.json')) 
    ? join(__dirname, 'config.json')
    : join(__dirname, 'config.example.json');
  
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    check('config file is valid JSON', true);
    check('projectKnowledge exists', !!config.projectKnowledge);
    check('database configured', !!config.projectKnowledge?.database);
  } else {
    check('config file is valid JSON', false, 'No config file found');
  }
} catch (e) {
  check('config file is valid JSON', false, 'Check JSON syntax');
}

// Check 4: Node.js version
console.log(chalk.yellow('\n🔧 Checking environment:'));
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
check(`Node.js version ${nodeVersion} (>= 16 required)`, majorVersion >= 16, 
  'Update Node.js to version 16 or higher');

// Check 5: Try to start server
console.log(chalk.yellow('\n🏃 Testing server startup:'));
const testServer = spawn('node', ['index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverStarted = false;
let serverError = '';

testServer.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Enhanced Sequential Thinking MCP Server running')) {
    serverStarted = true;
  } else if (output.includes('Error') || output.includes('error')) {
    serverError += output;
  }
});

testServer.on('error', (error) => {
  serverError = error.message;
});

// Wait for server to start
setTimeout(() => {
  check('Server starts successfully', serverStarted, 
    serverError ? `Fix error: ${serverError}` : 'Check error logs');
  
  testServer.kill();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  
  if (issues === 0) {
    console.log(chalk.green('\n✨ All checks passed! Ready to add to Claude Desktop.\n'));
    console.log('Add this to your claude_desktop_config.json:\n');
    console.log(chalk.cyan(JSON.stringify({
      "sequential-thinking-enhanced": {
        "command": process.platform === 'win32' ? "node.exe" : "node",
        "args": [join(__dirname, 'index.js').replace(/\\/g, '\\\\')]
      }
    }, null, 2)));
  } else {
    console.log(chalk.red(`\n⚠️  ${issues} issue(s) found. Please fix them before proceeding.\n`));
  }
  
  process.exit(issues > 0 ? 1 : 0);
}, 2000);
