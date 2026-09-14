// GENERATED FILE — do not edit here.
// Source of truth: motionkit-editor/src/lib/motionkit-engine/waapiEngine/
// Re-sync with `npm run copy:wporg` in the editor repo.

/**
 * Pure-DOM text splitting for the free engine.
 *
 * Wraps each character or word of an element in its own span so the runner can
 * stagger over them, then puts the element back exactly as it was. No dependency
 * on GSAP or its SplitText plugin — this is an independent implementation.
 */

// Where the pre-split markup is parked. Held on the element rather than in a module-level map so a detached or re-rendered node takes its own state with it instead of leaking an entry.
const ORIGINAL_HTML = '__mkSplitOriginalHtml';
// Whether the element had an aria-label of its own before the split, so revert can tell "remove the one we added" from "keep the author's".
const HAD_OWN_LABEL = '__mkSplitHadOwnLabel';

const PART_ATTR = 'data-mk-split';

const isSplit = (element) => ORIGINAL_HTML in element;

function makePart(text, kind) {
  const span = document.createElement('span');
  span.textContent = text;
  span.setAttribute(PART_ATTR, kind);
  // The parts are decoration: the element carries the real text as its accessible name, so assistive tech reads the word rather than spelling it out.
  span.setAttribute('aria-hidden', 'true');
  // inline-block so transforms apply — a plain inline span ignores translate and scale.
  span.style.display = 'inline-block';
  // Keeps the split from changing how the text wraps, which would otherwise reflow the page the moment an animation is attached.
  span.style.whiteSpace = 'pre';
  return span;
}

/* Walks the element's text nodes in place, replacing each with the split parts for its own text. Editing text nodes rather than rewriting innerHTML is what preserves nested inline markup: <em>fast</em> keeps its <em>, it just gains spans inside it. */
function splitTextNodes(root, kind, collected) {
  const walker = document.createTreeWalker(root, 4 /* SHOW_TEXT */);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }

  for (const node of textNodes) {
    const text = node.nodeValue;
    if (!text || !text.trim()) continue;

    const fragment = document.createDocumentFragment();
    // Split on whitespace but KEEP it: the separators are re-inserted as plain text so spacing and wrapping are unchanged, while only the visible pieces become animatable parts.
    const tokens = text.split(/(\s+)/);

    for (const token of tokens) {
      if (!token) continue;
      if (!token.trim()) {
        fragment.appendChild(document.createTextNode(token));
        continue;
      }

      if (kind === 'words') {
        const part = makePart(token, 'word');
        collected.push(part);
        fragment.appendChild(part);
      } else {
        // Array.from rather than split(''), so an emoji or accented character stays one part instead of being cut into surrogate halves.
        for (const char of Array.from(token)) {
          const part = makePart(char, 'char');
          collected.push(part);
          fragment.appendChild(part);
        }
      }
    }

    node.parentNode.replaceChild(fragment, node);
  }
}

/**
 * Splits an element's text into animatable parts.
 *
 * @param {HTMLElement} element The element to split.
 * @param {'chars'|'words'} [kind='chars'] What each part should be.
 * @returns {HTMLElement[]} The parts, in document order — the list the runner staggers over.
 */
export function splitText(element, kind = 'chars') {
  if (!element || typeof element.querySelectorAll !== 'function') return [];

  // Re-splitting would nest spans inside spans and park the already-split markup as the "original", making revert restore a broken state.
  if (isSplit(element)) {
    return Array.from(element.querySelectorAll(`[${PART_ATTR}]`));
  }

  const originalText = element.textContent;
  if (!originalText || !originalText.trim()) return [];

  element[ORIGINAL_HTML] = element.innerHTML;
  element[HAD_OWN_LABEL] = element.hasAttribute('aria-label');

  const collected = [];
  splitTextNodes(element, kind === 'words' ? 'words' : 'chars', collected);

  // The element's children are now aria-hidden decoration, so without this it has no accessible name at all.
  if (!element[HAD_OWN_LABEL]) {
    element.setAttribute('aria-label', originalText);
  }

  return collected;
}

/**
 * Puts a split element back exactly as it was. Safe to call on an element that
 * was never split, and safe to call twice.
 *
 * @param {HTMLElement} element The element to restore.
 */
export function revertSplit(element) {
  if (!element || !isSplit(element)) return;

  element.innerHTML = element[ORIGINAL_HTML];

  if (!element[HAD_OWN_LABEL]) {
    element.removeAttribute('aria-label');
  }

  delete element[ORIGINAL_HTML];
  delete element[HAD_OWN_LABEL];
}

// The split kinds the runner accepts. Anything else means "do not split", which is the default for every existing animation.
export const SPLIT_KINDS = ['chars', 'words'];

export function isSplitKind(value) {
  return SPLIT_KINDS.includes(value);
}
