const fs = require("fs");
const path = require("path");

// Paths
const rootDir = __dirname + "/.."; // adjust if scripts/ is at root level
const amplifyDir = path.join(rootDir, ".amplify-hosting");
const computeDir = path.join(amplifyDir, "compute", "default");
const staticDir = path.join(amplifyDir, "static");
const serverDir = path.join(rootDir, "server");
const distDir = path.join(rootDir, "dist");

// Clean previous
fs.rmSync(amplifyDir, { recursive: true, force: true });

// Recreate structure
fs.mkdirSync(computeDir, { recursive: true });
fs.mkdirSync(staticDir, { recursive: true });

// Copy frontend build (dist) to static
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

copyDir(distDir, staticDir);

// Copy backend index.js, db.js, and database.sqlite into compute/default
["index.js", "db.js", "database.sqlite"].forEach((file) => {
  const src = path.join(serverDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(computeDir, file));
  }
});

// Copy server/node_modules (only backend deps) into compute/default/node_modules
const serverNodeModules = path.join(serverDir, "node_modules");
const computeNodeModules = path.join(computeDir, "node_modules");
if (fs.existsSync(serverNodeModules)) {
  copyDir(serverNodeModules, computeNodeModules);
}

// Copy deploy-manifest.json
const manifestSrc = path.join(rootDir, ".amplify-hosting", "deploy-manifest.json");
if (!fs.existsSync(manifestSrc)) {
  // If you stored deploy-manifest.json elsewhere, adjust this path
  console.warn("deploy-manifest.json missing; ensure it exists under .amplify-hosting.");
}
