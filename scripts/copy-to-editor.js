#!/usr/bin/env node

/**
 * Copies compiled animation scripts from the WP plugin build output
 * to the MotionKit editor server's static directory.
 *
 * Two entry points:
 *   - CLI:      `node scripts/copy-to-editor.js`       (runs after `npm run build`)
 *   - Webpack:  require('./scripts/copy-to-editor').copyToEditor({ quiet: true })
 *              (fired from webpack afterEmit hook during `npm run start`)
 */

const fs = require('fs');
const path = require('path');

// Load .env from the plugin root so MOTIONKIT_EDITOR_PATH (and any other keys)
// are available via process.env without a dotenv dependency.
(function loadDotEnv() {
  const envFile = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envFile)) return;
  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
})();

const SRC = path.resolve(__dirname, '../assets/build/modules/animation-builder');

const DEST_CANDIDATES = [
  path.resolve('D:/motionkit AI development/motionkit-editor/server/static/animation-scripts'),
  path.resolve(__dirname, '../../../../../../../../motionkit AI development/motionkit-editor/server/static/animation-scripts'),
  path.resolve(__dirname, '../../../motionkit-editor/server/static/animation-scripts'),
  process.env.MOTIONKIT_EDITOR_PATH && path.resolve(process.env.MOTIONKIT_EDITOR_PATH, 'server/static/animation-scripts'),
].filter(Boolean);

// FILES is a list of paths relative to SRC. Each entry is either:
//   - a string  → src and dest paths are identical
//   - [src, dest] → copy src to a different dest filename
// The customAnimation editor variant is renamed at copy time so the
// motionkit-editor inject-bridge can keep loading customAnimation.js.
const FILES = [
  'frontend.js',
  'freeAnim.js',
  ['frontend/customAnimation.editor.js', 'frontend/customAnimation.js'],
  'frontend/editor-reset.js',
  'frontend/freePresets/generalSpaceInLeftAnim.js',
  'frontend/freePresets/generalSpaceInRightAnim.js',
  'frontend/freePresets/generalSwapAnim.js',
  'frontend/freePresets/generalTwisterInDownAnim.js',
  'frontend/freePresets/imageSwashInAnim.js',
  'frontend/freePresets/imageVanishInAnim.js',
  'frontend/freePresets/textClipRevealAnim.js',
  'frontend/freePresets/textClipSlideRightAnim.js',
  'frontend/freePresets/textClipSlideUpAnim.js',
  'frontend/presets/containerFadeAnim.js',
  'frontend/presets/cubeScrollRevealAnim.js',
  'frontend/presets/cursorHoverMoveAnim.js',
  'frontend/presets/cursorHoverRevealAnim.js',
  'frontend/presets/headerStickyAnim.js',
  'frontend/presets/horizontalScrollAnim.js',
  'frontend/presets/imageHoverRevealAnim.js',
  'frontend/presets/imageRevealAnim.js',
  'frontend/presets/imageScaleAnim.js',
  'frontend/presets/imageStretchAnim.js',
  'frontend/presets/popupMediaAnim.js',
  'frontend/presets/scrollVideoFrame.js',
  'frontend/presets/textInvertAnim.js',
  'frontend/presets/textRotateAnim.js',
  'frontend/presets/textScaleAnim.js',
  'frontend/presets/textSpinAnim.js',
  'frontend/presets/textSplitAnim.js',
];

function resolveDest() {
  return DEST_CANDIDATES.find((d) => {
    try { return fs.existsSync(path.dirname(d)); } catch { return false; }
  });
}

function copyToEditor({ quiet = false } = {}) {
  const dest = resolveDest();
  if (!dest) {
    if (!quiet) {
      console.warn('[copy-to-editor] Editor server path not found. Set MOTIONKIT_EDITOR_PATH env var.');
      console.warn('[copy-to-editor] Tried:', DEST_CANDIDATES);
    }
    return { copied: 0, skipped: 0, dest: null };
  }

  let copied = 0;
  let skipped = 0;

  for (const entry of FILES) {
    const [srcRel, destRel] = Array.isArray(entry) ? entry : [entry, entry];
    const src = path.join(SRC, srcRel);
    const out = path.join(dest, destRel);

    if (!fs.existsSync(src)) {
      skipped++;
      continue;
    }

    const outDir = path.dirname(out);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.copyFileSync(src, out);
    copied++;
  }

  if (!quiet) {
    console.log(`[copy-to-editor] Copied ${copied} files, skipped ${skipped} (not found in build).`);
    console.log(`[copy-to-editor] Destination: ${dest}`);
  } else if (copied > 0) {
    console.log(`[copy-to-editor] Synced ${copied} file${copied === 1 ? '' : 's'} → editor.`);
  }

  return { copied, skipped, dest };
}

module.exports = { copyToEditor };

if (require.main === module) {
  copyToEditor({ quiet: false });
}
