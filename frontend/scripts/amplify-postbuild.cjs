const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const amplifyDir = path.join(rootDir, ".amplify-hosting");
const staticDir = path.join(amplifyDir, "static");
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

// 1) Clean previous .amplify-hosting
fs.rmSync(amplifyDir, { recursive: true, force: true });

// 2) Recreate static directory
fs.mkdirSync(staticDir, { recursive: true });

// 3) Write minimal deploy-manifest.json for static hosting
const manifest = {
  version: 1,
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
