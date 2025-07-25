// Test script for Enhanced Sequential Thinking Server
// Run with: node test.js

import { spawn } from 'child_process';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🧪 Enhanced Sequential Thinking Test Suite\n');

// Start the server
const server = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';

server.stdout.on('data', (data) => {
  buffer += data.toString();
  try {
    // Try to parse complete JSON-RPC messages
    const lines = buffer.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].trim()) {
        const message = JSON.parse(lines[i]);
        console.log('📥 Server Response:', JSON.stringify(message, null, 2));
      }
    }
    buffer = lines[lines.length - 1];
  } catch (e) {
    // Buffer incomplete, wait for more data
  }
});

server.stderr.on('data', (data) => {
  console.log('📋 Server Log:', data.toString());
});

server.on('error', (error) => {
  console.error('❌ Server Error:', error);
});

// Test sequence
async function runTests() {
  console.log('\n📌 Running test sequence...\n');
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 1: Initialize server
  console.log('Test 1: Initialize connection');
  sendMessage({
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    },
    id: 1
  });
  
  await waitForResponse();
  
  // Test 2: List tools
  console.log('\nTest 2: List available tools');
  sendMessage({
    jsonrpc: "2.0",
    method: "tools/list",
    params: {},
    id: 2
  });
  
  await waitForResponse();
  
  // Test 3: Basic thought
  console.log('\nTest 3: Process a basic thought');
  sendMessage({
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "sequentialthinking",
      arguments: {
        thought: "Starting to debug the authentication issue",
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true
      }
    },
    id: 3
  });
  
  await waitForResponse();
  
  // Test 4: Create branch
  console.log('\nTest 4: Create a branch');
  sendMessage({
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "sequentialthinking_branch",
      arguments: {
        branchName: "test-branch"
      }
    },
    id: 4
  });
  
  await waitForResponse();
  
  // Test 5: Thought on branch
  console.log('\nTest 5: Add thought to branch');
  sendMessage({
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "sequentialthinking",
      arguments: {
        thought: "Investigating the test branch",
        thoughtNumber: 1,
        totalThoughts: 2,
        track: "test-branch",
        nextThoughtNeeded: true
      }
    },
    id: 5
  });
  
  await waitForResponse();
  
  // Test 6: Generate handoff
  console.log('\nTest 6: Generate handoff');
  sendMessage({
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "sequentialthinking_handoff",
      arguments: {}
    },
    id: 6
  });
  
  await waitForResponse();
  
  console.log('\n✅ Test sequence complete!\n');
  
  // Cleanup
  server.kill();
  process.exit(0);
}

function sendMessage(message) {
  const msgStr = JSON.stringify(message) + '\n';
  console.log('📤 Sending:', msgStr);
  server.stdin.write(msgStr);
}

function waitForResponse() {
  return new Promise(resolve => setTimeout(resolve, 500));
}

// Run tests
runTests().catch(error => {
  console.error('Test error:', error);
  server.kill();
  process.exit(1);
});
