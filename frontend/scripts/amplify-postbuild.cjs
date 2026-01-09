const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const amplifyDir = path.join(rootDir, ".amplify-hosting");
const computeDir = path.join(amplifyDir, "compute", "default");
const staticDir = path.join(amplifyDir, "static");
const serverDir = path.join(rootDir, "server");
const distDir = path.join(rootDir, "dist");

// Simple recursive copy
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

// 1) Clean previous .amplify-hosting
fs.rmSync(amplifyDir, { recursive: true, force: true });

// 2) Recreate structure
fs.mkdirSync(computeDir, { recursive: true });
fs.mkdirSync(staticDir, { recursive: true });

// 3) Recreate deploy-manifest.json
const manifest = {
  version: 1,
  routes: [
    {
      path: "/api/*",
      target: { kind: "Compute", src: "default" }
    },
    {
      path: "/uploads/*",
      target: { kind: "Compute", src: "default" }
    },
    {
      path: "/assets/*",
      target: { kind: "Static" }
    },
    {
      path: "/*",
      target: { kind: "Static" }
    }
  ],
  computeResources: [
    {
      name: "default",
      runtime: "nodejs20.x",
      entrypoint: "index.js"
    }
  ]
};

fs.writeFileSync(
  path.join(amplifyDir, "deploy-manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

// 4) Copy frontend build to static
copyDir(distDir, staticDir);

// 5) Copy backend core files into compute/default
["index.js", "db.js", "database.sqlite"].forEach((file) => {
  const src = path.join(serverDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(computeDir, file));
  }
});

// 6) Copy backend node_modules into compute/default/node_modules
const serverNodeModules = path.join(serverDir, "node_modules");
const computeNodeModules = path.join(computeDir, "node_modules");
copyDir(serverNodeModules, computeNodeModules);
