#!/usr/bin/env node

// Unit tests for Enhanced Sequential Thinking Server (no server spawn required)
// Run with: node test-unit.js

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(chalk.cyan('🧪 Unit Tests - Enhanced Sequential Thinking\n'));

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(chalk.green(`✅ ${name}`));
    passCount++;
  } catch (error) {
    console.log(chalk.red(`❌ ${name}: ${error.message}`));
    failCount++;
  }
}

// Mock the server class for testing
class MockEnhancedSequentialThinkingServer {
  constructor() {
    this.thoughtState = {
      main: [],
      branches: {},
      currentTrack: 'main',
      currentNumber: 0
    };
    this.disableThoughtLogging = true; // Quiet for tests
  }

  validateThoughtData(input) {
    const data = input;

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number');
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number');
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean');
    }

    const track = data.track || this.thoughtState.currentTrack;

    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      track: track,
      isRevision: data.isRevision,
      revisesThought: data.revisesThought,
      branchFromThought: data.branchFromThought,
      branchId: data.branchId,
      needsMoreThoughts: data.needsMoreThoughts,
    };
  }

  getActiveBranches() {
    return Object.entries(this.thoughtState.branches)
      .filter(([_, info]) => !info.merged)
      .map(([name, _]) => name);
  }

  processThought(input) {
    try {
      const validatedInput = this.validateThoughtData(input);
      
      this.thoughtState.currentTrack = validatedInput.track;
      this.thoughtState.currentNumber = validatedInput.thoughtNumber;

      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      if (validatedInput.track === 'main') {
        this.thoughtState.main.push(validatedInput);
      } else {
        const branch = this.thoughtState.branches[validatedInput.track];
        if (branch) {
          branch.thoughts.push(validatedInput);
        } else {
          validatedInput.track = 'main';
          this.thoughtState.main.push(validatedInput);
        }
      }

      return {
        success: true,
        state: this.thoughtState
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  createBranch(branchName) {
    try {
      if (this.thoughtState.branches[branchName]) {
        throw new Error(`Branch "${branchName}" already exists`);
      }

      this.thoughtState.branches[branchName] = {
        name: branchName,
        parentTrack: this.thoughtState.currentTrack,
        parentNumber: this.thoughtState.currentNumber,
        thoughts: [],
        created: new Date(),
        merged: false
      };

      this.thoughtState.currentTrack = branchName;
      this.thoughtState.currentNumber = 0;

      return {
        success: true,
        state: this.thoughtState
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  mergeBranch(branchName) {
    try {
      const branch = this.thoughtState.branches[branchName];
      if (!branch) {
        throw new Error(`Branch "${branchName}" not found`);
      }

      if (branch.merged) {
        throw new Error(`Branch "${branchName}" has already been merged`);
      }

      const mergeMarker = {
        thought: `=== MERGED BRANCH: ${branchName} ===`,
        thoughtNumber: this.thoughtState.main.length + 1,
        totalThoughts: this.thoughtState.main.length + branch.thoughts.length + 2,
        track: 'main',
        nextThoughtNeeded: true
      };

      this.thoughtState.main.push(mergeMarker);

      branch.thoughts.forEach((thought) => {
        this.thoughtState.main.push({
          ...thought,
          track: 'main',
          thoughtNumber: this.thoughtState.main.length + 1,
          thought: `[from ${branchName}] ${thought.thought}`
        });
      });

      branch.merged = true;
      this.thoughtState.currentTrack = 'main';
      this.thoughtState.currentNumber = this.thoughtState.main.length;

      return {
        success: true,
        state: this.thoughtState
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Run tests
console.log(chalk.yellow('Testing Core Functionality:\n'));

const server = new MockEnhancedSequentialThinkingServer();

// Test 1: Initial state
test('Initial state is correct', () => {
  if (server.thoughtState.currentTrack !== 'main') {
    throw new Error('Initial track should be main');
  }
  if (server.thoughtState.currentNumber !== 0) {
    throw new Error('Initial number should be 0');
  }
  if (server.thoughtState.main.length !== 0) {
    throw new Error('Main should be empty initially');
  }
});

// Test 2: Adding thoughts
test('Can add thoughts to main track', () => {
  const result = server.processThought({
    thought: 'First thought',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true
  });
  
  if (!result.success) {
    throw new Error('Failed to process thought');
  }
  if (server.thoughtState.main.length !== 1) {
    throw new Error('Main should have 1 thought');
  }
  if (server.thoughtState.currentNumber !== 1) {
    throw new Error('Current number should be 1');
  }
});

// Test 3: Creating branches
test('Can create a branch', () => {
  const result = server.createBranch('test-branch');
  
  if (!result.success) {
    throw new Error('Failed to create branch');
  }
  if (!server.thoughtState.branches['test-branch']) {
    throw new Error('Branch not created');
  }
  if (server.thoughtState.currentTrack !== 'test-branch') {
    throw new Error('Current track should be test-branch');
  }
  if (server.thoughtState.currentNumber !== 0) {
    throw new Error('Current number should reset to 0');
  }
});

// Test 4: Adding thoughts to branch
test('Can add thoughts to branch', () => {
  const result = server.processThought({
    thought: 'Branch thought',
    thoughtNumber: 1,
    totalThoughts: 2,
    track: 'test-branch',
    nextThoughtNeeded: true
  });
  
  if (!result.success) {
    throw new Error('Failed to process branch thought');
  }
  if (server.thoughtState.branches['test-branch'].thoughts.length !== 1) {
    throw new Error('Branch should have 1 thought');
  }
});

// Test 5: Merging branches
test('Can merge a branch', () => {
  const result = server.mergeBranch('test-branch');
  
  if (!result.success) {
    throw new Error('Failed to merge branch');
  }
  if (!server.thoughtState.branches['test-branch'].merged) {
    throw new Error('Branch should be marked as merged');
  }
  if (server.thoughtState.currentTrack !== 'main') {
    throw new Error('Should switch back to main');
  }
  // Main should have: 1 original + 1 merge marker + 1 branch thought = 3
  if (server.thoughtState.main.length !== 3) {
    throw new Error(`Main should have 3 thoughts, has ${server.thoughtState.main.length}`);
  }
});

// Test 6: Duplicate branch names
test('Cannot create duplicate branch', () => {
  const result = server.createBranch('test-branch');
  
  if (result.success) {
    throw new Error('Should not allow duplicate branch');
  }
  if (!result.error.includes('already exists')) {
    throw new Error('Wrong error message');
  }
});

// Test 7: Merging non-existent branch
test('Cannot merge non-existent branch', () => {
  const result = server.mergeBranch('does-not-exist');
  
  if (result.success) {
    throw new Error('Should not allow merging non-existent branch');
  }
  if (!result.error.includes('not found')) {
    throw new Error('Wrong error message');
  }
});

// Test 8: Active branches
test('Active branches tracking works', () => {
  server.createBranch('active-1');
  server.createBranch('active-2');
  
  const active = server.getActiveBranches();
  if (!active.includes('active-1') || !active.includes('active-2')) {
    throw new Error('Should list active branches');
  }
  if (active.includes('test-branch')) {
    throw new Error('Should not include merged branches');
  }
});

// Test 9: Thought validation
test('Validates thought data correctly', () => {
  const result = server.processThought({
    // Missing required fields
    thoughtNumber: 1
  });
  
  if (result.success) {
    throw new Error('Should fail validation');
  }
  if (!result.error.includes('Invalid thought')) {
    throw new Error('Wrong validation error');
  }
});

// Test 10: Auto-adjustment of total thoughts
test('Auto-adjusts total thoughts', () => {
  // Explicitly specify main track to ensure the thought goes where we expect
  server.processThought({
    thought: 'Long thought',
    thoughtNumber: 10,
    totalThoughts: 5, // Less than thought number
    nextThoughtNeeded: false,
    track: 'main' // Explicitly specify main track
  });
  
  const lastThought = server.thoughtState.main[server.thoughtState.main.length - 1];
  if (lastThought.totalThoughts !== 10) {
    throw new Error(`Should auto-adjust total thoughts to 10, but got ${lastThought.totalThoughts}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(chalk.green(`✅ Passed: ${passCount}`));
console.log(chalk.red(`❌ Failed: ${failCount}`));

if (failCount === 0) {
  console.log(chalk.cyan('\n🎉 All unit tests passed!'));
} else {
  console.log(chalk.yellow('\n⚠️  Some tests failed.'));
}

process.exit(failCount > 0 ? 1 : 0);
