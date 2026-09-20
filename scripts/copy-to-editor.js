#!/usr/bin/env node

// Copies the WAAPI engine out of this repo (its source of truth) into motionkit-editor,
// completing the reverse of what motionkit-editor's old copy-waapi-to-wporg.mjs used to do
// before ownership moved here. Two different things travel, for two different reasons:
//   1. The compiled engine-only bundle (assets/build/motionkit-waapi-engine.js) — the editor's
//      preview iframe only ever needs to load it as a script, never to import from its source.
//      This same bundle also carries window.MotionKitWaapi.isWaapiAnimation, which is why that
//      classifier does NOT need its own source-file sync below — the router asks the loaded
//      bundle instead, and shared/animationKind.js hand-mirrors the same rule for its own tests.
//   2. shared/catalogue.js as a real SOURCE file — the editor's "Add Property" UI statically
//      imports it, so a compiled bundle would not do.
// Run `npm run build` first so assets/build/motionkit-waapi-engine.js exists.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname ? path.resolve(__dirname, '..') : process.cwd();

// Same loader convention motionkit-editor's own copy scripts use — no dotenv dependency, and keys already in the environment win so a re-run is a no-op.
function loadDotEnv() {
  const envFile = path.join(ROOT, '.env');
  if (!fs.existsSync(envFile)) return;
  for (const raw of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

const EDITOR_DIR = process.env.MOTIONKIT_EDITOR_PATH
  ? path.resolve(process.env.MOTIONKIT_EDITOR_PATH)
  : null;

const BUNDLE_SRC = path.join(ROOT, 'assets/build/motionkit-waapi-engine.js');
const BUNDLE_DEST_REL = 'server/static/animation-scripts/waapi.js';

const SHARED_DIR = path.join(ROOT, 'src/motionkit-waapi/shared');
const SHARED_FILES = ['catalogue.js'];
const SHARED_DEST_REL =
  'src/lib/motionkit-engine/animationEngine/waapi/shared';

const HEADER =
  '// GENERATED FILE — do not edit here.\n' +
  '// Source of truth: motionkit/src/motionkit-waapi/shared/\n' +
  '// Re-sync with `npm run copy:to-editor` in the motionkit repo.\n\n';

const quiet = process.argv.includes('--quiet');

// No path set at all is a CI/production build with no editor checkout — exit 0, matching the same policy the editor's own copy-waapi-to-wporg.mjs used.
if (!EDITOR_DIR) {
  if (!quiet) {
    console.warn(
      '[copy-to-editor] MOTIONKIT_EDITOR_PATH is not set — the engine was NOT copied to motionkit-editor.\n' +
        '  Set it in .env, e.g.\n' +
        '  MOTIONKIT_EDITOR_PATH=/absolute/path/to/motionkit-editor',
    );
  }
  process.exit(0);
}

// A path that is set but wrong is a typo or a moved checkout — a hard error, not a silent skip.
if (!fs.existsSync(EDITOR_DIR)) {
  console.error(
    `[copy-to-editor] MOTIONKIT_EDITOR_PATH is set but the path does not exist: ${EDITOR_DIR}`,
  );
  process.exit(1);
}

if (!fs.existsSync(BUNDLE_SRC)) {
  console.error(
    `[copy-to-editor] no build output at ${BUNDLE_SRC} — run \`npm run build\` first.`,
  );
  process.exit(1);
}

const bundleDest = path.join(EDITOR_DIR, BUNDLE_DEST_REL);
fs.mkdirSync(path.dirname(bundleDest), { recursive: true });
fs.copyFileSync(BUNDLE_SRC, bundleDest);

const sharedDestDir = path.join(EDITOR_DIR, SHARED_DEST_REL);
fs.mkdirSync(sharedDestDir, { recursive: true });
for (const name of SHARED_FILES) {
  const src = path.join(SHARED_DIR, name);
  if (!fs.existsSync(src)) {
    console.error(`[copy-to-editor] missing source file: ${src}`);
    process.exit(1);
  }
  fs.writeFileSync(
    path.join(sharedDestDir, name),
    HEADER + fs.readFileSync(src, 'utf8'),
  );
}

if (!quiet) {
  console.log(
    `[copy-to-editor] copied ${BUNDLE_DEST_REL} and ${SHARED_FILES.length} shared file(s) → ${EDITOR_DIR}`,
  );
}
