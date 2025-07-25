#!/usr/bin/env node

// Comprehensive test suite for Enhanced Sequential Thinking Server
// Run with: node test-server.js

import { spawn } from 'child_process';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Enhanced Sequential Thinking Server Test Suite\n');

let server;
let testsPassed = 0;
let testsFailed = 0;
let currentTest = '';

// Test utilities
function log(message, type = 'info') {
  const symbols = {
    info: '📌',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🔍'
  };
  console.log(`${symbols[type] || '•'} ${message}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer() {
  log('Starting server...', 'info');
  
  server = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, DISABLE_THOUGHT_LOGGING: 'true' } // Quiet mode for testing
  });

  let serverReady = false;
  
  server.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Enhanced Sequential Thinking MCP Server running')) {
      serverReady = true;
    }
    if (process.env.DEBUG) {
      console.log('[Server Log]', output);
    }
  });

  server.on('error', (error) => {
    log(`Server error: ${error.message}`, 'error');
  });

  // Wait for server to be ready
  let attempts = 0;
  while (!serverReady && attempts < 20) {
    await sleep(100);
    attempts++;
  }

  if (!serverReady) {
    throw new Error('Server failed to start');
  }

  log('Server started successfully', 'success');
  return server;
}

async function sendRequest(method, params = {}, id = 1) {
  const request = {
    jsonrpc: "2.0",
    method,
    params,
    id
  };
  
  if (process.env.DEBUG) {
    console.log('[Request]', JSON.stringify(request, null, 2));
  }
  
  server.stdin.write(JSON.stringify(request) + '\n');
  
  return new Promise((resolve, reject) => {
    let buffer = '';
    
    const handler = (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const response = JSON.parse(line);
            if (response.id === id) {
              server.stdout.removeListener('data', handler);
              if (process.env.DEBUG) {
                console.log('[Response]', JSON.stringify(response, null, 2));
              }
              resolve(response);
              return;
            }
          } catch (e) {
            // Not a complete JSON yet
          }
        }
      }
      buffer = lines[lines.length - 1];
    };
    
    server.stdout.on('data', handler);
    
    // Timeout after 2 seconds
    setTimeout(() => {
      server.stdout.removeListener('data', handler);
      reject(new Error('Request timeout'));
    }, 2000);
  });
}

async function runTest(name, testFn) {
  currentTest = name;
  log(`Test: ${name}`, 'test');
  
  try {
    await testFn();
    log(`PASSED: ${name}`, 'success');
    testsPassed++;
  } catch (error) {
    log(`FAILED: ${name} - ${error.message}`, 'error');
    testsFailed++;
  }
}

// Test cases
async function runTests() {
  // Test 1: Initialize connection
  await runTest('Initialize MCP connection', async () => {
    const response = await sendRequest('initialize', {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    });
    
    if (!response.result) {
      throw new Error('No result in response');
    }
    if (!response.result.capabilities) {
      throw new Error('No capabilities in response');
    }
  });

  // Test 2: List tools
  await runTest('List available tools', async () => {
    const response = await sendRequest('tools/list', {});
    
    if (!response.result?.tools) {
      throw new Error('No tools in response');
    }
    
    const toolNames = response.result.tools.map(t => t.name);
    const expectedTools = [
      'sequentialthinking',
      'sequentialthinking_branch',
      'sequentialthinking_merge',
      'sequentialthinking_handoff',
      'sequentialthinking_resume'
    ];
    
    for (const expected of expectedTools) {
      if (!toolNames.includes(expected)) {
        throw new Error(`Missing tool: ${expected}`);
      }
    }
  });

  // Test 3: Basic sequential thinking
  await runTest('Process basic thought', async () => {
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking',
      arguments: {
        thought: "Testing the enhanced server",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      }
    }, 3);
    
    const content = response.result?.content?.[0]?.text;
    if (!content) {
      throw new Error('No content in response');
    }
    
    // Check for self-reinforcing output
    if (!content.includes('Continue from: [main:2]')) {
      throw new Error('Missing self-reinforcing output');
    }
  });

  // Test 4: Create branch
  await runTest('Create a branch', async () => {
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking_branch',
      arguments: {
        branchName: 'test-investigation'
      }
    }, 4);
    
    const content = response.result?.content?.[0]?.text;
    if (!content.includes('Created branch "test-investigation"')) {
      throw new Error('Branch creation failed');
    }
    if (!content.includes('Continue from: [test-investigation:1]')) {
      throw new Error('Branch not set as current track');
    }
  });

  // Test 5: Add thought to branch
  await runTest('Add thought to branch', async () => {
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking',
      arguments: {
        thought: "Investigating on the branch",
        thoughtNumber: 1,
        totalThoughts: 2,
        track: 'test-investigation',
        nextThoughtNeeded: true
      }
    }, 5);
    
    const content = response.result?.content?.[0]?.text;
    if (!content.includes('"track": "test-investigation"')) {
      throw new Error('Thought not added to correct track');
    }
  });

  // Test 6: Merge branch
  await runTest('Merge branch back to main', async () => {
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking_merge',
      arguments: {
        branchName: 'test-investigation'
      }
    }, 6);
    
    const content = response.result?.content?.[0]?.text;
    if (!content.includes('Successfully merged branch')) {
      throw new Error('Branch merge failed');
    }
    if (!content.includes('Continue from: [main:')) {
      throw new Error('Not switched back to main track');
    }
  });

  // Test 7: Generate handoff
  await runTest('Generate handoff document', async () => {
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking_handoff',
      arguments: {}
    }, 7);
    
    const content = response.result?.content?.[0]?.text;
    if (!content.includes('Handoff generated: handoff-')) {
      throw new Error('Handoff generation failed');
    }
    
    // Extract filename from response
    const match = content.match(/Handoff generated: (handoff-[\d\-T]+\.md)/);
    if (!match) {
      throw new Error('Could not extract handoff filename');
    }
    
    const handoffFile = match[1];
    const handoffPath = join(process.cwd(), handoffFile);
    
    // Verify file exists
    if (!existsSync(handoffPath)) {
      throw new Error('Handoff file not created');
    }
    
    // Store filename for next test
    global.testHandoffFile = handoffFile;
  });

  // Test 8: Resume from handoff
  await runTest('Resume from handoff', async () => {
    if (!global.testHandoffFile) {
      throw new Error('No handoff file from previous test');
    }
    
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking_resume',
      arguments: {
        filename: global.testHandoffFile
      }
    }, 8);
    
    const content = response.result?.content?.[0]?.text;
    if (!content.includes('Successfully resumed from')) {
      throw new Error('Resume failed');
    }
    
    // Clean up test file
    try {
      unlinkSync(join(process.cwd(), global.testHandoffFile));
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  // Test 9: Error handling - duplicate branch
  await runTest('Error handling: duplicate branch name', async () => {
    // First create a branch
    await sendRequest('tools/call', {
      name: 'sequentialthinking_branch',
      arguments: { branchName: 'duplicate-test' }
    }, 91);
    
    // Try to create same branch again
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking_branch',
      arguments: { branchName: 'duplicate-test' }
    }, 92);
    
    const content = response.result?.content?.[0]?.text;
    if (!content.includes('already exists')) {
      throw new Error('Duplicate branch error not caught');
    }
  });

  // Test 10: Error handling - merge non-existent branch
  await runTest('Error handling: merge non-existent branch', async () => {
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking_merge',
      arguments: { branchName: 'does-not-exist' }
    }, 10);
    
    const content = response.result?.content?.[0]?.text;
    if (!content.includes('not found')) {
      throw new Error('Non-existent branch error not caught');
    }
  });

  // Test 11: Project knowledge injection
  await runTest('Project knowledge injection', async () => {
    const response = await sendRequest('tools/call', {
      name: 'sequentialthinking',
      arguments: {
        thought: "Checking the database connection",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      }
    }, 11);
    
    const content = response.result?.content?.[0]?.text;
    if (!content.includes('Relevant project knowledge')) {
      throw new Error('Project knowledge not injected');
    }
    if (!content.includes('Railway PostgreSQL')) {
      throw new Error('Database knowledge not found');
    }
  });
}

// Main test runner
async function main() {
  try {
    // Start server
    await startServer();
    
    // Run tests
    await runTests();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    log(`Tests Passed: ${testsPassed}`, 'success');
    log(`Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'error' : 'success');
    
    if (testsFailed === 0) {
      console.log('\n🎉 All tests passed! The server is ready for use.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
  } finally {
    // Clean up
    if (server) {
      server.kill();
    }
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

// Run with DEBUG=1 for verbose output
if (process.argv.includes('--debug')) {
  process.env.DEBUG = '1';
}

main();
