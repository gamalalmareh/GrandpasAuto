const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const amplifyDir = path.join(rootDir, ".amplify-hosting");
const computeDir = path.join(amplifyDir, "compute", "default");
const staticDir = path.join(amplifyDir, "static");
const serverDir = path.join(rootDir, "server");
const distDir = path.join(rootDir, "dist");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean previous
fs.rmSync(amplifyDir, { recursive: true, force: true });

// Recreate structure
fs.mkdirSync(computeDir, { recursive: true });
fs.mkdirSync(staticDir, { recursive: true });

// Copy frontend build to static
copyDir(distDir, staticDir);

// Copy backend core files into compute/default
["index.js", "db.js", "database.sqlite"].forEach((file) => {
  const src = path.join(serverDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(computeDir, file));
  }
});

// Copy server node_modules into compute/default/node_modules
const serverNodeModules = path.join(serverDir, "node_modules");
const computeNodeModules = path.join(computeDir, "node_modules");
copyDir(serverNodeModules, computeNodeModules);

// Ensure deploy-manifest.json is present (already in .amplify-hosting)
const manifestPath = path.join(amplifyDir, "deploy-manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.warn("deploy-manifest.json is missing under .amplify-hosting");
}
