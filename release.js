#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.cyan('🚀 Sequential Thinking Enhanced - Release Helper\n'));

// Get current version from package.json
const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
const currentVersion = packageJson.version;

console.log(`Current version: ${chalk.yellow(currentVersion)}`);

// Check for uncommitted changes
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (gitStatus.trim()) {
    console.error(chalk.red('\n❌ Error: You have uncommitted changes. Please commit or stash them first.'));
    console.log('\nUncommitted files:');
    console.log(chalk.gray(gitStatus));
    process.exit(1);
  }
} catch (error) {
  console.error(chalk.red('❌ Error: Not a git repository or git not installed'));
  process.exit(1);
}

// Get new version from command line
const newVersion = process.argv[2];
if (!newVersion) {
  console.error(chalk.red('\n❌ Error: Please provide a version number'));
  console.log('\nUsage: node release.js <version>');
  console.log('Example: node release.js 1.1.0');
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error(chalk.red('\n❌ Error: Invalid version format'));
  console.log('Please use semantic versioning: MAJOR.MINOR.PATCH');
  process.exit(1);
}

console.log(`New version: ${chalk.green(newVersion)}\n`);

// Update package.json
console.log('📝 Updating package.json...');
packageJson.version = newVersion;
writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
console.log(chalk.green('✓ package.json updated'));

// Update CHANGELOG.md
console.log('\n📝 Updating CHANGELOG.md...');
const changelog = readFileSync('CHANGELOG.md', 'utf-8');
const today = new Date().toISOString().split('T')[0];
const newChangelogEntry = `## [${newVersion}] - ${today}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n`;

// Insert new version after the [Unreleased] section
const updatedChangelog = changelog.replace(
  '## [Unreleased]',
  `## [Unreleased]\n\n${newChangelogEntry}`
);
writeFileSync('CHANGELOG.md', updatedChangelog);
console.log(chalk.green('✓ CHANGELOG.md updated'));
console.log(chalk.yellow('  ⚠️  Please edit CHANGELOG.md to add release notes'));

// Run tests
console.log('\n🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log(chalk.green('\n✓ All tests passed'));
} catch (error) {
  console.error(chalk.red('\n❌ Tests failed. Please fix before releasing.'));
  process.exit(1);
}

// Show next steps
console.log(chalk.cyan(`
╔══════════════════════════════════════════════════╗
║              Release Preparation Complete         ║
╚══════════════════════════════════════════════════╝

${chalk.green('✅ Next steps:')}

1. ${chalk.yellow('Edit CHANGELOG.md')} to add release notes for v${newVersion}

2. ${chalk.yellow('Commit the changes:')}
   git add package.json CHANGELOG.md
   git commit -m "chore: prepare release v${newVersion}"

3. ${chalk.yellow('Create and push the tag:')}
   git tag v${newVersion}
   git push origin main
   git push origin v${newVersion}

4. ${chalk.yellow('GitHub Actions will automatically:')}
   - Run all tests
   - Create a GitHub release
   - Upload release artifacts

5. ${chalk.yellow('After release, update npm package (if publishing):')}
   npm publish

${chalk.cyan('📦 The release will include:')}
- Source code archive (.tar.gz and .zip)
- Release notes from CHANGELOG.md
- Automated test results

${chalk.green('Good luck with the release! 🚀')}
`));
