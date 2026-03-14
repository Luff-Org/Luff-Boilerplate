#!/usr/bin/env node

const degit = require("degit");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectName = process.argv[2];

if (!projectName) {
  console.log("\x1b[31m%s\x1b[0m", "❌ Error: You must provide a project name.");
  console.log("Example:");
  console.log("  npx create-luff-app my-new-startup");
  process.exit(1);
}

const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);

if (fs.existsSync(projectPath)) {
  console.log(
    "\x1b[31m%s\x1b[0m",
    `❌ Error: Folder '${projectName}' already exists in this directory.`
  );
  process.exit(1);
}

async function main() {
  try {
    console.log("\x1b[36m%s\x1b[0m", "🚀 Downloading Luff Boilerplate...");

    const emitter = degit("Luff-Org/Luff-Boilerplate", {
      cache: false,
      force: true,
      verbose: true
    });

    await emitter.clone(projectPath);

    process.chdir(projectPath);

    console.log("\x1b[36m%s\x1b[0m", "🧹 Cleaning up repository history...");

    try {
      fs.rmSync(path.join(projectPath, ".git"), {
        recursive: true,
        force: true
      });
    } catch {}

    console.log("\x1b[36m%s\x1b[0m", "📝 Updating package.json...");

    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf8")
    );

    packageJson.name = projectName;

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );

    console.log("\x1b[36m%s\x1b[0m", "📦 Installing dependencies...");

    execSync("npm install", { stdio: "inherit" });

    console.log("\x1b[36m%s\x1b[0m", "🌱 Initializing Git repository...");

    execSync("git init -b main", { stdio: "inherit" });
    execSync("git add .", { stdio: "inherit" });
    execSync(
      'git commit -m "chore: initial commit from create-luff-app" --no-verify',
      { stdio: "inherit" }
    );

    console.log("");
    console.log("\x1b[32m%s\x1b[0m", "✅ Installation Complete!");
    console.log("");
    console.log("Next steps:");
    console.log(`  cd ${projectName}`);
    console.log(
      "  docker compose -f docker/docker-compose.yml up auth-db posts-db -d"
    );
    console.log("  npm run dev");
    console.log("");
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "❌ Installation Failed!");
    console.error(error.message);
    process.exit(1);
  }
}

main();