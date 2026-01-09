const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const amplifyDir = path.join(rootDir, ".amplify-hosting");
const staticDir = path.join(amplifyDir, "static");
const serverOutDir = path.join(amplifyDir, "server");
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

// 1) Clean previous
fs.rmSync(amplifyDir, { recursive: true, force: true });

// 2) Recreate dirs
fs.mkdirSync(staticDir, { recursive: true });
fs.mkdirSync(serverOutDir, { recursive: true });

// 3) Write deploy-manifest.json
const manifest = {
  version: 1,
  serverSideRendering: {
    runtime: "nodejs20.x",
    computeType: "lambda",
    entry: "server/index.js",
    routes: [
      { path: "/api/*" },
      { path: "/uploads/*" }
    ]
  },
  staticAssets: {
    baseDirectory: "static",
    routes: [
      { path: "/assets/*" },
      { path: "/*" }
    ]
  }
};

fs.writeFileSync(
  path.join(amplifyDir, "deploy-manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

// 4) Copy frontend build into static/
copyDir(distDir, staticDir);

// 5) Copy backend into server/ (matching entry: server/index.js)
["index.js", "db.js", "database.sqlite"].forEach((file) => {
  const src = path.join(serverDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(serverOutDir, file));
  }
});

// 6) Copy backend node_modules into server/node_modules
const serverNodeModules = path.join(serverDir, "node_modules");
const computeNodeModules = path.join(serverOutDir, "node_modules");
copyDir(serverNodeModules, computeNodeModules);
