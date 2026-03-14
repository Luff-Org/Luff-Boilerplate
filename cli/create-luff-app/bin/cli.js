#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

if (process.argv.length < 3) {
  console.log('\x1b[31m%s\x1b[0m', '❌ Error: You must provide a name for your project.');
  console.log('For example:');
  console.log('    npx create-luff-app my-new-startup');
  process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const GIT_REPO = '/Users/harshtanwar/Documents/Luff-Org/Luff-Boilerplate';

if (fs.existsSync(projectPath)) {
  console.log('\x1b[31m%s\x1b[0m', `❌ Error: The folder '${projectName}' already exists in the current directory.`);
  process.exit(1);
}

async function main() {
  try {
    console.log('\x1b[36m%s\x1b[0m', '🚀 Downloading the Luff Microservices Boilerplate...');
    execSync(`git clone --depth 1 ${GIT_REPO} ${projectPath}`, { stdio: 'inherit' });

    process.chdir(projectPath);

    console.log('\x1b[36m%s\x1b[0m', '🧹 Cleaning up boilerplate histories...');
    // Delete .git history so the user starts fresh
    fs.rmSync(path.join(projectPath, '.git'), { recursive: true, force: true });
    
    // Delete the CLI tool itself from the downloaded project
    fs.rmSync(path.join(projectPath, 'cli'), { recursive: true, force: true });

    console.log('\x1b[36m%s\x1b[0m', '📝 Updating package.json...');
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = require(packageJsonPath);
    packageJson.name = projectName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log('\x1b[36m%s\x1b[0m', '🌱 Initializing new Git repository...');
    execSync('git init -b main', { stdio: 'inherit' });

    console.log('\x1b[36m%s\x1b[0m', '⚙️  Setting up environment variables & installing dependencies...');
    execSync('bash scripts/setup.sh', { stdio: 'inherit' });

    console.log('\x1b[36m%s\x1b[0m', '💾 Committing initial project state...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "chore: initial commit from create-luff-app"', { stdio: 'inherit' });

    console.log('\x1b[32m%s\x1b[0m', '✅ Installation Complete!');
    console.log('');
    console.log('Inside that directory, you can run several commands:');
    console.log('  npm run dev');
    console.log('    Starts the Turborepo development server.');
    console.log('  npm run build');
    console.log('    Builds the apps for production.');
    console.log('');
    console.log('We suggest that you begin by typing:');
    console.log('\x1b[36m%s\x1b[0m', `  cd ${projectName}`);
    console.log('\x1b[36m%s\x1b[0m', '  docker compose -f docker/docker-compose.yml up auth-db posts-db -d');
    console.log('\x1b[36m%s\x1b[0m', '  npm run dev');

  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m', '❌ Installation Failed!');
    console.log(error);
    process.exit(1);
  }
}

main();
