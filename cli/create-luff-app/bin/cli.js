#!/usr/bin/env node
/* eslint-env node */

const degit = require("degit");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

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
      verbose: true,
    });

    await emitter.clone(projectPath);

    process.chdir(projectPath);

    // Ask about AI Feature
    const enableAI = await question("\x1b[33m✨ Would you like to enable the AI Chatbot feature (RAG + GPT-4o)? (y/n): \x1b[0m");
    rl.close();

    if (enableAI.toLowerCase() !== "y") {
      console.log("\x1b[36m%s\x1b[0m", "🧹 Removing AI module...");
      try {
        fs.rmSync(path.join(projectPath, "backend/ai-service"), { recursive: true, force: true });
        fs.rmSync(path.join(projectPath, "frontend/src/app/chat"), { recursive: true, force: true });
        
        // Clean up Gateway index.ts
        const gatewayIndexPath = path.join(projectPath, "backend/api-gateway/src/index.ts");
        if (fs.existsSync(gatewayIndexPath)) {
          let content = fs.readFileSync(gatewayIndexPath, "utf8");
          content = content.replace(/import { authProxy, postsProxy, paymentProxy, aiProxy } from '.\/routes\/proxy';/, "import { authProxy, postsProxy, paymentProxy } from './routes/proxy';");
          content = content.replace(/\/\/ Proxy \/ai\/\* → ai service\napp\.use\('\/ai', aiProxy\);\n/, "");
          fs.writeFileSync(gatewayIndexPath, content);
        }
      } catch (e) {
        console.log("  Notice: Could not fully remove AI files, skipping.");
      }
    }

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
      "  docker compose -f docker/docker-compose.yml up auth-db posts-db payment-db -d"
    );
    console.log(
      "  set up .env files from .env.example files, can also use script > npm run setup"
    );
    if (enableAI.toLowerCase() === 'y') {
      console.log("\x1b[35m%s\x1b[0m", "  💡 Don't forget to add OPENAI_API_KEY and UPSTASH_VECTOR keys to backend/ai-service/.env!");
    }
    console.log("  npm run dev");
    console.log("");
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "❌ Installation Failed!");
    console.error(error.message);
    process.exit(1);
  }
}

main();