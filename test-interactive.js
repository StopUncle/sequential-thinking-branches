#!/usr/bin/env node

// Interactive test client for Enhanced Sequential Thinking Server
// Run with: node test-interactive.js

import { spawn } from 'child_process';
import { createInterface } from 'readline';
import chalk from 'chalk';

console.log(chalk.cyan('🔧 Enhanced Sequential Thinking - Interactive Test Client\n'));
console.log('This allows you to manually test the server before adding to Claude Desktop.\n');

const server = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let requestId = 1;
let initialized = false;

// Setup readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green('test> ')
});

// Handle server output
let buffer = '';
server.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (line) {
      try {
        const response = JSON.parse(line);
        console.log(chalk.blue('\n📥 Server Response:'));
        console.log(JSON.stringify(response, null, 2));
        
        // Parse and display content nicely
        if (response.result?.content?.[0]?.text) {
          console.log(chalk.yellow('\n📄 Content:'));
          console.log(response.result.content[0].text);
        }
        
        console.log(); // Empty line
        rl.prompt();
      } catch (e) {
        // Not JSON, might be a log
      }
    }
  }
  buffer = lines[lines.length - 1];
});

// Handle server errors
server.stderr.on('data', (data) => {
  const output = data.toString();
  if (!output.includes('✓ Loaded project knowledge') && 
      !output.includes('Enhanced Sequential Thinking MCP Server running')) {
    console.log(chalk.gray('[Server] ' + output.trim()));
  }
});

// Helper functions
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    method,
    params,
    id: requestId++
  };
  
  console.log(chalk.gray('\n📤 Sending: ' + JSON.stringify(request)));
  server.stdin.write(JSON.stringify(request) + '\n');
}

function showHelp() {
  console.log(chalk.cyan('\nAvailable Commands:'));
  console.log('  init               - Initialize MCP connection');
  console.log('  list               - List available tools');
  console.log('  think <text>       - Add a thought');
  console.log('  branch <name>      - Create a new branch');
  console.log('  merge <name>       - Merge a branch');
  console.log('  handoff            - Generate handoff document');
  console.log('  resume <file>      - Resume from handoff file');
  console.log('  status             - Show current state');
  console.log('  demo               - Run a demo sequence');
  console.log('  help               - Show this help');
  console.log('  exit               - Exit the test client\n');
}

// Current state tracking
let currentTrack = 'main';
let currentNumber = 0;

// Command handlers
const commands = {
  init: () => {
    sendRequest('initialize', {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    });
    initialized = true;
  },
  
  list: () => {
    if (!initialized) {
      console.log(chalk.red('Please run "init" first'));
      return;
    }
    sendRequest('tools/list', {});
  },
  
  think: (args) => {
    if (!initialized) {
      console.log(chalk.red('Please run "init" first'));
      return;
    }
    
    const thought = args.join(' ');
    if (!thought) {
      console.log(chalk.red('Please provide a thought'));
      return;
    }
    
    currentNumber++;
    sendRequest('tools/call', {
      name: 'sequentialthinking',
      arguments: {
        thought,
        thoughtNumber: currentNumber,
        totalThoughts: currentNumber + 5, // Estimate
        nextThoughtNeeded: true,
        track: currentTrack
      }
    });
  },
  
  branch: (args) => {
    if (!initialized) {
      console.log(chalk.red('Please run "init" first'));
      return;
    }
    
    const branchName = args[0];
    if (!branchName) {
      console.log(chalk.red('Please provide a branch name'));
      return;
    }
    
    sendRequest('tools/call', {
      name: 'sequentialthinking_branch',
      arguments: { branchName }
    });
    
    currentTrack = branchName;
    currentNumber = 0;
  },
  
  merge: (args) => {
    if (!initialized) {
      console.log(chalk.red('Please run "init" first'));
      return;
    }
    
    const branchName = args[0];
    if (!branchName) {
      console.log(chalk.red('Please provide a branch name'));
      return;
    }
    
    sendRequest('tools/call', {
      name: 'sequentialthinking_merge',
      arguments: { branchName }
    });
    
    currentTrack = 'main';
  },
  
  handoff: () => {
    if (!initialized) {
      console.log(chalk.red('Please run "init" first'));
      return;
    }
    
    sendRequest('tools/call', {
      name: 'sequentialthinking_handoff',
      arguments: {}
    });
  },
  
  resume: (args) => {
    if (!initialized) {
      console.log(chalk.red('Please run "init" first'));
      return;
    }
    
    const filename = args[0];
    if (!filename) {
      console.log(chalk.red('Please provide a handoff filename'));
      return;
    }
    
    sendRequest('tools/call', {
      name: 'sequentialthinking_resume',
      arguments: { filename }
    });
  },
  
  status: () => {
    console.log(chalk.cyan('\nCurrent State:'));
    console.log(`  Track: ${currentTrack}`);
    console.log(`  Number: ${currentNumber}`);
    console.log(`  Initialized: ${initialized}\n`);
  },
  
  demo: async () => {
    console.log(chalk.magenta('\n🎭 Running Demo Sequence...\n'));
    
    // Initialize if not already
    if (!initialized) {
      commands.init();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Demo sequence
    const demoSteps = [
      () => commands.think(['Starting to debug the login issue']),
      () => commands.think(['Checking the authentication endpoint']),
      () => commands.think(['Found an error in the logs']),
      () => commands.branch(['investigate-error']),
      () => commands.think(['Examining the error details']),
      () => commands.think(['Error is due to missing environment variable']),
      () => commands.merge(['investigate-error']),
      () => commands.think(['Fixed by adding JWT_SECRET to environment']),
      () => commands.handoff([])
    ];
    
    for (const step of demoSteps) {
      step();
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log(chalk.magenta('\n✨ Demo complete!\n'));
  },
  
  help: showHelp,
  
  exit: () => {
    console.log(chalk.yellow('\nGoodbye! 👋'));
    server.kill();
    process.exit(0);
  }
};

// Start interactive session
console.log(chalk.green('Server starting...'));

setTimeout(() => {
  showHelp();
  rl.prompt();
}, 1000);

// Handle commands
rl.on('line', (line) => {
  const [cmd, ...args] = line.trim().split(' ');
  
  if (commands[cmd]) {
    commands[cmd](args);
  } else if (cmd) {
    console.log(chalk.red(`Unknown command: ${cmd}`));
    console.log(chalk.gray('Type "help" for available commands'));
  }
  
  rl.prompt();
});

// Handle exit
rl.on('close', () => {
  commands.exit();
});

process.on('SIGINT', () => {
  commands.exit();
});
