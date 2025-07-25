#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load project knowledge from config
let projectKnowledge = {};
try {
  const configPath = join(__dirname, 'config.json');
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    projectKnowledge = config.projectKnowledge || {};
    console.error(chalk.green('✓ Loaded project knowledge from config.json'));
  }
} catch (error) {
  console.error(chalk.yellow('⚠ Could not load config.json, continuing without project knowledge'));
}

class EnhancedSequentialThinkingServer {
  constructor() {
    this.thoughtState = {
      main: [],
      branches: {},
      currentTrack: 'main',
      currentNumber: 0
    };
    
    this.disableThoughtLogging = (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
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

    // Default track to current track
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

  formatThought(thoughtData) {
    const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, track } = thoughtData;

    let prefix = '';
    let context = '';

    if (isRevision) {
      prefix = chalk.yellow('🔄 Revision');
      context = ` (revising thought ${revisesThought})`;
    } else if (track !== 'main') {
      prefix = chalk.green('🌿 Branch');
      context = ` [${track}]`;
    } else {
      prefix = chalk.blue('💭 Thought');
      context = ' [main]';
    }

    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const thoughtLines = thought.split('\n');
    const maxLineLength = Math.max(header.length, ...thoughtLines.map(line => line.length));
    const border = '─'.repeat(maxLineLength + 4);

    const formattedLines = thoughtLines.map(line => 
      `│ ${line.padEnd(maxLineLength + 2)} │`
    ).join('\n');

    return `
┌${border}┐
│ ${header.padEnd(maxLineLength + 2)} │
├${border}┤
${formattedLines}
└${border}┘`;
  }

  getActiveBranches() {
    return Object.entries(this.thoughtState.branches)
      .filter(([_, info]) => !info.merged)
      .map(([name, _]) => name);
  }

  createSelfReinforcingOutput(track, nextNumber) {
    const activeBranches = this.getActiveBranches();
    const branchesText = activeBranches.length > 0 
      ? `Active branches: ${activeBranches.join(', ')}`
      : 'No active branches';

    return `\n---\nContinue from: [${track}:${nextNumber}]\n${branchesText}\n---`;
  }

  injectProjectKnowledge(thought) {
    const lowerThought = thought.toLowerCase();
    
    // Check for database queries
    if (lowerThought.includes('database') || lowerThought.includes('postgres') || lowerThought.includes('sql')) {
      return projectKnowledge.database || null;
    }
    
    // Check for auth queries
    if (lowerThought.includes('auth') || lowerThought.includes('clerk') || lowerThought.includes('login')) {
      return projectKnowledge.auth || null;
    }
    
    // Check for framework queries
    if (lowerThought.includes('framework') || lowerThought.includes('fastapi')) {
      return projectKnowledge.framework || null;
    }
    
    // Check for endpoint queries
    if (lowerThought.includes('endpoint') || lowerThought.includes('api') || lowerThought.includes('route')) {
      return projectKnowledge.key_endpoints ? 
        `Key endpoints:\n${projectKnowledge.key_endpoints.join('\n')}` : null;
    }
    
    return null;
  }

  processThought(input) {
    try {
      const validatedInput = this.validateThoughtData(input);
      
      // Update current state
      this.thoughtState.currentTrack = validatedInput.track;
      this.thoughtState.currentNumber = validatedInput.thoughtNumber;

      // Adjust total thoughts if needed
      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      // Store thought in appropriate track
      if (validatedInput.track === 'main') {
        this.thoughtState.main.push(validatedInput);
      } else {
        const branch = this.thoughtState.branches[validatedInput.track];
        if (branch) {
          branch.thoughts.push(validatedInput);
        } else {
          // If branch doesn't exist, log error and store in main
          console.error(chalk.red(`Warning: Branch "${validatedInput.track}" not found, storing thought in main track`));
          validatedInput.track = 'main';
          this.thoughtState.main.push(validatedInput);
        }
      }

      // Log formatted thought
      if (!this.disableThoughtLogging) {
        const formattedThought = this.formatThought(validatedInput);
        console.error(formattedThought);
      }

      // Check for relevant project knowledge
      const relevantKnowledge = this.injectProjectKnowledge(validatedInput.thought);
      
      // Create response with self-reinforcing output
      const nextNumber = validatedInput.nextThoughtNeeded ? validatedInput.thoughtNumber + 1 : validatedInput.thoughtNumber;
      const reinforcement = this.createSelfReinforcingOutput(validatedInput.track, nextNumber);
      
      let responseText = JSON.stringify({
        thoughtNumber: validatedInput.thoughtNumber,
        totalThoughts: validatedInput.totalThoughts,
        track: validatedInput.track,
        nextThoughtNeeded: validatedInput.nextThoughtNeeded,
        activeBranches: this.getActiveBranches(),
        thoughtHistoryLength: this.thoughtState.main.length + 
          Object.values(this.thoughtState.branches).reduce((sum, b) => sum + b.thoughts.length, 0)
      }, null, 2);

      if (relevantKnowledge) {
        responseText += `\n\nRelevant project knowledge:\n${relevantKnowledge}`;
      }
      
      responseText += reinforcement;

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
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

      const reinforcement = this.createSelfReinforcingOutput(branchName, 1);

      return {
        content: [{
          type: "text",
          text: `Created branch "${branchName}" from [${this.thoughtState.branches[branchName].parentTrack}:${this.thoughtState.branches[branchName].parentNumber}]${reinforcement}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  mergeBranch(branchName) {
    try {
      const branch = this.thoughtState.branches[branchName];
      if (!branch) {
        // Suggest similar branch names
        const branchNames = Object.keys(this.thoughtState.branches);
        const suggestions = branchNames.filter(name => 
          name.toLowerCase().includes(branchName.toLowerCase()) ||
          branchName.toLowerCase().includes(name.toLowerCase())
        );
        
        throw new Error(`Branch "${branchName}" not found. ${
          suggestions.length > 0 
            ? `Did you mean: ${suggestions.join(', ')}?` 
            : `Available branches: ${branchNames.join(', ')}`
        }`);
      }

      if (branch.merged) {
        throw new Error(`Branch "${branchName}" has already been merged`);
      }

      // Merge the branch thoughts back to main with clear markers
      const mergeMarker = {
        thought: `=== MERGED BRANCH: ${branchName} ===\nBranch created from [${branch.parentTrack}:${branch.parentNumber}]\nContained ${branch.thoughts.length} thoughts`,
        thoughtNumber: this.thoughtState.main.length + 1,
        totalThoughts: this.thoughtState.main.length + branch.thoughts.length + 2,
        track: 'main',
        nextThoughtNeeded: true
      };

      this.thoughtState.main.push(mergeMarker);

      // Add all branch thoughts to main
      branch.thoughts.forEach((thought, index) => {
        this.thoughtState.main.push({
          ...thought,
          track: 'main',
          thoughtNumber: this.thoughtState.main.length + 1,
          thought: `[from ${branchName}] ${thought.thought}`
        });
      });

      // Mark branch as merged
      branch.merged = true;
      
      // Switch back to main track
      this.thoughtState.currentTrack = 'main';
      this.thoughtState.currentNumber = this.thoughtState.main.length;

      const reinforcement = this.createSelfReinforcingOutput('main', this.thoughtState.currentNumber + 1);

      return {
        content: [{
          type: "text",
          text: `Successfully merged branch "${branchName}" into main. Added ${branch.thoughts.length} thoughts.${reinforcement}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  generateHandoff() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `handoff-${timestamp}.md`;
      const filepath = join(__dirname, filename);

      let markdown = `# Sequential Thinking Handoff\n\n`;
      markdown += `Generated: ${new Date().toISOString()}\n\n`;
      
      // Add project knowledge
      markdown += `## Project Knowledge\n\n`;
      markdown += `\`\`\`json\n${JSON.stringify(projectKnowledge, null, 2)}\n\`\`\`\n\n`;
      
      // Add current state
      markdown += `## Current State\n\n`;
      markdown += `- Current Track: ${this.thoughtState.currentTrack}\n`;
      markdown += `- Current Thought: ${this.thoughtState.currentNumber}\n`;
      markdown += `- Active Branches: ${this.getActiveBranches().join(', ') || 'None'}\n\n`;
      
      // Add main track thoughts
      markdown += `## Main Track (${this.thoughtState.main.length} thoughts)\n\n`;
      this.thoughtState.main.forEach(thought => {
        markdown += `### [main:${thought.thoughtNumber}]\n\n`;
        markdown += `${thought.thought}\n\n`;
      });
      
      // Add branch thoughts
      Object.entries(this.thoughtState.branches).forEach(([name, branch]) => {
        markdown += `## Branch: ${name} ${branch.merged ? '(MERGED)' : '(ACTIVE)'}\n\n`;
        markdown += `- Parent: [${branch.parentTrack}:${branch.parentNumber}]\n`;
        markdown += `- Created: ${branch.created.toISOString()}\n`;
        markdown += `- Thoughts: ${branch.thoughts.length}\n\n`;
        
        branch.thoughts.forEach(thought => {
          markdown += `### [${name}:${thought.thoughtNumber}]\n\n`;
          markdown += `${thought.thought}\n\n`;
        });
      });
      
      // Add resume instructions
      markdown += `## Resume Instructions\n\n`;
      markdown += `To resume this session, use the \`resume\` command with this handoff file.\n\n`;
      markdown += `### State Data\n\n`;
      markdown += `\`\`\`json\n${JSON.stringify(this.thoughtState, null, 2)}\n\`\`\`\n`;

      writeFileSync(filepath, markdown, 'utf-8');
      console.error(chalk.green(`✓ Handoff file saved to: ${filepath}`));

      return {
        content: [{
          type: "text",
          text: `Handoff generated: ${filename}\nSaved to: ${filepath}\n\nThis file contains:\n- All ${this.thoughtState.main.length} main thoughts\n- ${Object.keys(this.thoughtState.branches).length} branches\n- Project knowledge\n- Current state for resuming`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  resumeFromHandoff(filename) {
    try {
      const filepath = join(__dirname, filename);
      if (!existsSync(filepath)) {
        throw new Error(`Handoff file not found: ${filename}`);
      }

      const content = readFileSync(filepath, 'utf-8');
      
      // Extract state data from markdown
      const stateMatch = content.match(/### State Data\s*\n\s*\n\s*```json\s*\n([\s\S]+?)\n\s*```/);  // More flexible regex
      if (!stateMatch) {
        throw new Error('Could not find state data in handoff file');
      }

      const stateData = JSON.parse(stateMatch[1]);
      
      // Restore state
      this.thoughtState = {
        main: stateData.main || [],
        branches: stateData.branches || {},
        currentTrack: stateData.currentTrack || 'main',
        currentNumber: stateData.currentNumber || 0
      };

      // Convert branch created dates back to Date objects
      Object.values(this.thoughtState.branches).forEach(branch => {
        branch.created = new Date(branch.created);
      });

      const reinforcement = this.createSelfReinforcingOutput(
        this.thoughtState.currentTrack, 
        this.thoughtState.currentNumber + 1
      );

      return {
        content: [{
          type: "text",
          text: `Successfully resumed from ${filename}\n\nRestored:\n- ${this.thoughtState.main.length} main thoughts\n- ${Object.keys(this.thoughtState.branches).length} branches\n- Current position: [${this.thoughtState.currentTrack}:${this.thoughtState.currentNumber}]${reinforcement}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}

// Tool definitions
const SEQUENTIAL_THINKING_TOOL = {
  name: "sequentialthinking",
  description: `Enhanced sequential thinking tool with branching capabilities. All the original functionality PLUS the ability to create branches for investigations without losing your main train of thought.`,
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "Your current thinking step"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thought step is needed"
      },
      thoughtNumber: {
        type: "integer",
        description: "Current thought number",
        minimum: 1
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total thoughts needed",
        minimum: 1
      },
      track: {
        type: "string",
        description: "Current track (main or branch name). Defaults to current track."
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises previous thinking"
      },
      revisesThought: {
        type: "integer",
        description: "Which thought is being reconsidered",
        minimum: 1
      },
      branchFromThought: {
        type: "integer",
        description: "Branching point thought number",
        minimum: 1
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      needsMoreThoughts: {
        type: "boolean",
        description: "If more thoughts are needed"
      }
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]
  }
};

const BRANCH_TOOL = {
  name: "sequentialthinking_branch",
  description: "Create a new branch for investigating a side issue without losing your main train of thought",
  inputSchema: {
    type: "object",
    properties: {
      branchName: {
        type: "string",
        description: "Name for the new branch (e.g., 'investigate-error', 'check-database')"
      }
    },
    required: ["branchName"]
  }
};

const MERGE_TOOL = {
  name: "sequentialthinking_merge",
  description: "Merge a branch back into the main thought sequence",
  inputSchema: {
    type: "object",
    properties: {
      branchName: {
        type: "string",
        description: "Name of the branch to merge"
      }
    },
    required: ["branchName"]
  }
};

const HANDOFF_TOOL = {
  name: "sequentialthinking_handoff",
  description: "Generate a handoff document with all thoughts, branches, and project knowledge",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

const RESUME_TOOL = {
  name: "sequentialthinking_resume",
  description: "Resume from a previously generated handoff document",
  inputSchema: {
    type: "object",
    properties: {
      filename: {
        type: "string",
        description: "Filename of the handoff document"
      }
    },
    required: ["filename"]
  }
};

// Server setup
const server = new Server(
  {
    name: "sequential-thinking-enhanced",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const thinkingServer = new EnhancedSequentialThinkingServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    SEQUENTIAL_THINKING_TOOL,
    BRANCH_TOOL,
    MERGE_TOOL,
    HANDOFF_TOOL,
    RESUME_TOOL
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "sequentialthinking":
      return thinkingServer.processThought(request.params.arguments);
    
    case "sequentialthinking_branch":
      const branchArgs = request.params.arguments;
      return thinkingServer.createBranch(branchArgs.branchName);
    
    case "sequentialthinking_merge":
      const mergeArgs = request.params.arguments;
      return thinkingServer.mergeBranch(mergeArgs.branchName);
    
    case "sequentialthinking_handoff":
      return thinkingServer.generateHandoff();
    
    case "sequentialthinking_resume":
      const resumeArgs = request.params.arguments;
      return thinkingServer.resumeFromHandoff(resumeArgs.filename);
    
    default:
      return {
        content: [{
          type: "text",
          text: `Unknown tool: ${request.params.name}`
        }],
        isError: true
      };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(chalk.green("✨ Enhanced Sequential Thinking MCP Server running"));
  console.error(chalk.cyan("Features: Branching, Self-reinforcing output, Handoff/Resume, Project knowledge"));
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
