#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { homedir, platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(chalk.cyan(`
╔══════════════════════════════════════════════════╗
║     Sequential Thinking Enhanced - Setup         ║
╚══════════════════════════════════════════════════╝
`));

// Step 1: Check Node version
console.log(chalk.blue('📋 Checking prerequisites...'));
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  console.error(chalk.red(`❌ Node.js version ${nodeVersion} is too old. Please upgrade to Node.js 18 or higher.`));
  process.exit(1);
}
console.log(chalk.green(`✓ Node.js ${nodeVersion} detected`));

// Step 2: Check if dependencies are installed
if (!existsSync(join(__dirname, 'node_modules'))) {
  console.log(chalk.yellow('📦 Installing dependencies...'));
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log(chalk.green('✓ Dependencies installed'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to install dependencies'));
    process.exit(1);
  }
} else {
  console.log(chalk.green('✓ Dependencies already installed'));
}

// Step 3: Create config.json if it doesn't exist
const configPath = join(__dirname, 'config.json');
const configExamplePath = join(__dirname, 'config.example.json');

if (!existsSync(configPath)) {
  console.log(chalk.yellow('⚙️ Creating config.json...'));
  try {
    const exampleConfig = readFileSync(configExamplePath, 'utf-8');
    writeFileSync(configPath, exampleConfig);
    console.log(chalk.green('✓ Created config.json from example'));
    console.log(chalk.cyan('  → Please edit config.json to add your project-specific knowledge'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to create config.json'));
  }
} else {
  console.log(chalk.green('✓ config.json already exists'));
}

// Step 4: Detect Claude Desktop config location
console.log(chalk.blue('\n🔍 Detecting Claude Desktop configuration...'));

let configDir;
let configFile;

if (platform() === 'win32') {
  configDir = join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Claude');
  configFile = join(configDir, 'claude_desktop_config.json');
} else if (platform() === 'darwin') {
  configDir = join(homedir(), 'Library', 'Application Support', 'Claude');
  configFile = join(configDir, 'claude_desktop_config.json');
} else {
  configDir = join(homedir(), '.config', 'Claude');
  configFile = join(configDir, 'claude_desktop_config.json');
}

console.log(chalk.cyan(`  → Config location: ${configFile}`));

// Step 5: Check if Claude config exists and offer to update it
if (existsSync(configFile)) {
  console.log(chalk.green('✓ Claude Desktop configuration found'));
  
  try {
    const config = JSON.parse(readFileSync(configFile, 'utf-8'));
    const serverPath = __dirname.replace(/\\/g, '\\\\'); // Escape backslashes for Windows
    
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    if (!config.mcpServers['sequential-thinking-enhanced']) {
      console.log(chalk.yellow('\n📝 Adding Sequential Thinking Enhanced to Claude Desktop...'));
      
      config.mcpServers['sequential-thinking-enhanced'] = {
        command: 'node',
        args: [join(serverPath, 'index.js')]
      };
      
      // Create backup
      const backupFile = `${configFile}.backup.${Date.now()}`;
      writeFileSync(backupFile, readFileSync(configFile, 'utf-8'));
      console.log(chalk.gray(`  → Backup created: ${backupFile}`));
      
      // Write updated config
      writeFileSync(configFile, JSON.stringify(config, null, 2));
      console.log(chalk.green('✓ Added to Claude Desktop configuration'));
      console.log(chalk.yellow('\n⚠️  Please restart Claude Desktop for changes to take effect'));
    } else {
      console.log(chalk.green('✓ Sequential Thinking Enhanced already configured in Claude Desktop'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Failed to update Claude Desktop configuration'));
    console.error(chalk.gray(error.message));
  }
} else {
  console.log(chalk.yellow('⚠️  Claude Desktop configuration not found'));
  console.log(chalk.cyan('\nPlease add the following to your claude_desktop_config.json:'));
  
  const serverPath = __dirname.replace(/\\/g, '\\\\');
  const configSnippet = {
    mcpServers: {
      'sequential-thinking-enhanced': {
        command: 'node',
        args: [join(serverPath, 'index.js')]
      }
    }
  };
  
  console.log(chalk.gray(JSON.stringify(configSnippet, null, 2)));
}

// Step 6: Run validation
console.log(chalk.blue('\n🔧 Running validation...'));
try {
  execSync('node validate.js', { stdio: 'inherit', cwd: __dirname });
} catch (error) {
  console.error(chalk.red('❌ Validation failed'));
}

// Step 7: Show next steps
console.log(chalk.cyan(`
╔══════════════════════════════════════════════════╗
║                  Setup Complete!                 ║
╚══════════════════════════════════════════════════╝

${chalk.green('✅ Next steps:')}

1. ${chalk.yellow('Edit config.json')} to add your project-specific knowledge
2. ${chalk.yellow('Restart Claude Desktop')} to load the enhanced server
3. ${chalk.yellow('Test the tool')} by typing [main:1] in Claude

${chalk.blue('📚 Quick commands:')}
- Create branch: ${chalk.gray('[branch: feature-name]')}
- Merge branch: ${chalk.gray('[merge: feature-name]')}
- Save session: ${chalk.gray('[handoff]')}
- Resume session: ${chalk.gray('[resume: handoff-file.md]')}

${chalk.cyan('Need help?')} Check out:
- README.md for full documentation
- QUICKSTART.md for usage examples
- DEMO.md for a complete walkthrough

${chalk.green('Happy debugging! 🚀')}
`));
