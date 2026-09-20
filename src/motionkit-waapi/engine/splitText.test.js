// Covers the pure-DOM text splitter the free engine uses to animate characters and words. GSAP's SplitText is a paid plugin, so this is an independent implementation; nothing here is derived from it.
//
// The risky part is not the splitting, it is putting the element back. A split rewrites the element's innerHTML, so a splitter that cannot restore exactly leaves the page permanently altered — and one that loses the accessible name turns "Hello" into a screen reader spelling out H-e-l-l-o.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

let dom;
let splitText;
let revertSplit;

beforeEach(async () => {
  dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  ({ splitText, revertSplit } = await import('./splitText.js'));
});

afterEach(() => {
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.Node;
  dom.window.close();
});

const el = (html) => {
  const node = document.createElement('h1');
  node.innerHTML = html;
  document.body.appendChild(node);
  return node;
};

describe('splitText chars', () => {
  test('should_return_one_node_per_visible_character', () => {
    const node = el('Hey');
    const parts = splitText(node, 'chars');
    assert.equal(parts.length, 3);
    assert.deepEqual(
      parts.map((p) => p.textContent),
      ['H', 'e', 'y'],
    );
  });

  // A space must not become an animatable target: staggering over it leaves a visible gap in the sequence for something the reader cannot see.
  test('should_not_emit_a_node_for_whitespace', () => {
    const node = el('a b');
    const parts = splitText(node, 'chars');
    assert.deepEqual(
      parts.map((p) => p.textContent),
      ['a', 'b'],
    );
  });

  test('should_preserve_the_rendered_text', () => {
    const node = el('Hello world');
    splitText(node, 'chars');
    assert.equal(node.textContent, 'Hello world');
  });
});

describe('splitText words', () => {
  test('should_return_one_node_per_word', () => {
    const node = el('the quick fox');
    const parts = splitText(node, 'words');
    assert.deepEqual(
      parts.map((p) => p.textContent),
      ['the', 'quick', 'fox'],
    );
  });

  test('should_preserve_the_rendered_text', () => {
    const node = el('the quick fox');
    splitText(node, 'words');
    assert.equal(node.textContent, 'the quick fox');
  });
});

describe('splitText accessibility', () => {
  // Without this the element's accessible name becomes the concatenation of its span children, which assistive tech reads character by character.
  test('should_carry_the_original_text_as_an_aria_label', () => {
    const node = el('Hello');
    splitText(node, 'chars');
    assert.equal(node.getAttribute('aria-label'), 'Hello');
  });

  test('should_hide_the_generated_parts_from_assistive_tech', () => {
    const node = el('Hi');
    const parts = splitText(node, 'chars');
    for (const p of parts) {
      assert.equal(p.getAttribute('aria-hidden'), 'true');
    }
  });
});

describe('revertSplit', () => {
  test('should_restore_the_original_markup_exactly', () => {
    const node = el('Hello <em>there</em>');
    const before = node.innerHTML;
    splitText(node, 'chars');
    assert.notEqual(
      node.innerHTML,
      before,
      'split should have changed the DOM',
    );
    revertSplit(node);
    assert.equal(node.innerHTML, before);
  });

  test('should_remove_the_aria_label_it_added', () => {
    const node = el('Hello');
    splitText(node, 'chars');
    revertSplit(node);
    assert.equal(node.getAttribute('aria-label'), null);
  });

  // An element that already had its own aria-label must keep it, not lose it to the revert.
  test('should_keep_a_pre_existing_aria_label', () => {
    const node = el('Hello');
    node.setAttribute('aria-label', 'Greeting');
    splitText(node, 'chars');
    revertSplit(node);
    assert.equal(node.getAttribute('aria-label'), 'Greeting');
  });

  test('should_be_safe_to_call_on_an_unsplit_element', () => {
    const node = el('Hello');
    const before = node.innerHTML;
    revertSplit(node);
    assert.equal(node.innerHTML, before);
  });

  test('should_be_idempotent', () => {
    const node = el('Hello');
    const before = node.innerHTML;
    splitText(node, 'chars');
    revertSplit(node);
    revertSplit(node);
    assert.equal(node.innerHTML, before);
  });
});

describe('splitText guards', () => {
  test('should_return_an_empty_list_for_a_missing_element', () => {
    assert.deepEqual(splitText(null, 'chars'), []);
  });

  test('should_not_re_split_an_already_split_element', () => {
    const node = el('Hello');
    const first = splitText(node, 'chars');
    const second = splitText(node, 'chars');
    assert.equal(second.length, first.length);
    assert.equal(node.textContent, 'Hello');
  });

  // Nested markup is the case a naive textContent rewrite destroys: the <em> would be flattened away.
  test('should_keep_inline_markup_when_splitting_words', () => {
    const node = el('go <em>fast</em>');
    splitText(node, 'words');
    assert.ok(
      node.querySelector('em'),
      'inline element must survive the split',
    );
    assert.equal(node.textContent, 'go fast');
  });
});
