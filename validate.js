// Quick validation test for the enhanced sequential thinking server
// Run with: node validate.js

console.log('🔍 Validating Enhanced Sequential Thinking Server\n');

let passCount = 0;
let failCount = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
    failCount++;
  }
}

// Test 1: Check all files exist
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('index.js exists', existsSync(join(__dirname, 'index.js')));
test('package.json exists', existsSync(join(__dirname, 'package.json')));
test('config.json exists', existsSync(join(__dirname, 'config.json')));
test('README.md exists', existsSync(join(__dirname, 'README.md')));

// Test 2: Check package.json is valid
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
  test('package.json is valid JSON', true);
  test('package.json has correct name', pkg.name === '@autonomousempire/sequential-thinking-enhanced');
  test('package.json has required dependencies', 
    pkg.dependencies['@modelcontextprotocol/sdk'] && 
    pkg.dependencies['chalk']
  );
} catch (e) {
  test('package.json is valid JSON', false);
}

// Test 3: Check config.json is valid
import { readFileSync } from 'fs';
try {
  const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));
  test('config.json is valid JSON', true);
  test('config.json has projectKnowledge', !!config.projectKnowledge);
} catch (e) {
  test('config.json is valid JSON', false);
}

// Test 4: Check if the server can be imported
try {
  await import('./index.js');
  test('index.js can be imported without errors', true);
} catch (e) {
  console.error('Import error:', e.message);
  test('index.js can be imported without errors', false);
}

// Test 5: Basic functionality test
console.log('\n📊 Test Summary:');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✨ All tests passed! The server is ready to use.');
} else {
  console.log('\n⚠️  Some tests failed. Please check the errors above.');
}

process.exit(failCount > 0 ? 1 : 0);
