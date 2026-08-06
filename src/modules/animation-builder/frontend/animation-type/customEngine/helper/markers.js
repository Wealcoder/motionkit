// Restyle ScrollTrigger's debug markers into a MotionKit badge carrying the animation's name,
// so a page with several scroll animations is readable instead of four identical green/red bars.
//
// GSAP owns the marker's geometry (position/top/right/width/transform) and repositions it on
// every refresh — so nothing here touches those. The outer node keeps its box and its border,
// which is the line marking the exact scroll position; the badge is an inner pill.

// mkOverlayLogo.png from the editor, inlined so the preview iframe and a published page both
// render it without a plugin-URL lookup. 48x60, ~1.5KB base64.
const LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA8CAYAAAAgwDn8AAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAA+tJREFUeAHVmktME0EYgGeWPmxttdZERVFrPBqx8eDBR1IuJt705k304hFIvHgwQEwMJ8WjegASE9QLGh9EMbaJwRjQtCQIJGpYQxB5CEtbKN3SjvsDgzxautuZ6cKXbEqzw/b72tl0t7sICYIQ4teWMFmkSVs8aKuwJD9FVhPeEhE55LdGRB75zR2hSfl0yC9HoM2GJhUkxqhEHLDQP260TQWO7XXUuu0lfrsFezIEySPRVCj0U6l/crVU1rEtBRkj7/iLTYOeKyf3VJWX2it3OLAvrmaUuRSKTCaSNWeOuCLLAxvexate9syT4EAm2zLY1Bn353sxeEezzPUAzPeldSun1yBMuY22d7lpxPdlKBnO9tGNx9LkUedMLYzDDztVf6lLCrvsUs6NqfNE+T2dqLh6ZkV1jgjtAWJlbWnGGCsr1vm0h+qlp43aOhltIH/z/O5g+X6rL9eYWZWgux+mK3Brtxrc57YEUB70RrCiR57S/SsZkqwSzjs9AJu2X+zf6QjeeRO9iARhRB7wea1+CXZYpBOIOH7A2Vb/Kn4FccaoPIAx8kjIILCvnDy4rZlnRCHyFMMBAM8IFnmgoACARtx+HatFBcIqDxQcAEDEKZ+zrpAIHvIAUwBgK8GGI3jJA8wBgJEInvIAlwAAIs4e3V7X2p3KGcFbHuAWQNnnLskaIUIe4B4ArI0QJQ9YkCCWItCL3okWUfIAhsPojY5EWYgl0+iQlygnyqxCTiEn4hkxUwgA+YNegkTJU4QEUHl/mRWJhntAMeUBrgHFlge4BZghD3AJMEse4BLgdWVMkQeYv8i82wkqL7Mhs2D+BHY4CDIT5gAJI1NhP6GxmFvAHDD4N43MhDlgLIoXfuYzC+aAndtKUPu3lGkRXL4HdjutpkVwO5QwK4LrwZwZEdwPp4sdIeSEppgRwk4pixUhLABw2yzK06+z90VGCAugl6SunXZVP+6aqRcVISQgOU/kldfTrp9z14mK4B4A8v1D6rqLgaIiuAZQ+ZoLDjnbehER3ALyyVN4R3AJiM5ldMlTeEYwBwwrqtwWHtctT+EVwRQA8u/7pyqa9d0Msg4eEQUHsMpTWCMKChiLzUd4yFNYIgwHfB9XI+29w9zkKYVEwFgpkcrIev8B5D/9GNHkjxi9uUkXRiPsFixLqTRp0TNYtDzFSET/qBqSOvpmG4eVlLzRQHlSDRVDnqInYjSalls6lfqFJ5XaVcSWz8nw2tvN3vamybMutRGZxIOPsTq4vWwt/X9SwbZwwgdjVv2sdq8jFnDapADB0mGnDff0jSQiDZd2hZCJwJt7PeAJYLR4Y1bHQOL5rQv/nf4BIQuRy2mUeJAAAAAASUVORK5CYII=";

const STYLE_ID = "motionkit-marker-style";
// Editor design tokens --accent / --accent-light. Start and end read apart by fill vs outline
// rather than by hue, so the markers stay on brand.
const ACCENT = "#2c76e6";
const ACCENT_LIGHT = "#71a5e8";
const MAX_TITLE = 20;

const MARKER_CSS = `
/* GSAP pins the scroller markers to a fixed 149px box; direction:rtl makes a wider pill spill
   leftward into the page instead of off the right edge, without touching that geometry. */
.mk-mk{background:none!important;border-width:0!important;
 padding:0!important;font-size:0!important;line-height:0!important;direction:rtl!important}
.mk-mk__pill{direction:ltr;display:inline-flex;align-items:center;gap:6px;vertical-align:bottom;
 margin:3px 6px;padding:3px 9px 3px 4px;border-radius:999px;
 background:rgba(15,16,21,.92);box-shadow:0 1px 8px rgba(0,0,0,.4),inset 0 0 0 1px rgba(255,255,255,.1);
 font:600 11px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
 color:#f4f4f5;letter-spacing:.01em;white-space:nowrap;backdrop-filter:blur(6px)}
.mk-mk__logo{width:13px;height:13px;flex:none;object-fit:contain;display:block}
.mk-mk__role{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;
 padding:1px 5px;border-radius:999px}
.mk-mk--start .mk-mk__role{background:${ACCENT};color:#fff}
.mk-mk--end .mk-mk__role{color:${ACCENT_LIGHT};box-shadow:inset 0 0 0 1px ${ACCENT_LIGHT}59}
.mk-mk--scroller .mk-mk__pill{background:rgba(15,16,21,.62);color:#d4d4d8;font-weight:500}
.mk-mk--scroller .mk-mk__logo{opacity:.55}
`;

function ensureStyle(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const tag = doc.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = MARKER_CSS;
  (doc.head || doc.documentElement).appendChild(tag);
}

// GSAP writes "start-<id>" / "scroller-end-<id>" as the marker text; we replace it wholesale.
function decorate(node, title, role, scroller) {
  if (!node || node.dataset.mkMarker) return;
  node.dataset.mkMarker = "1";
  ensureStyle(node.ownerDocument);

  node.classList.add("mk-mk", `mk-mk--${role}`);
  if (scroller) node.classList.add("mk-mk--scroller");

  const pill = node.ownerDocument.createElement("span");
  pill.className = "mk-mk__pill";

  const logo = node.ownerDocument.createElement("img");
  logo.className = "mk-mk__logo";
  logo.src = LOGO;
  logo.alt = "";

  // Long titles would push the badge across the page, so cap them.
  const name = node.ownerDocument.createElement("span");
  name.textContent =
    title.length > MAX_TITLE ? `${title.slice(0, MAX_TITLE - 1)}…` : title;

  const tag = node.ownerDocument.createElement("span");
  tag.className = "mk-mk__role";
  tag.textContent = scroller ? `scroller ${role}` : role;

  pill.append(logo, name, tag);
  node.textContent = "";
  node.appendChild(pill);
}

// The two scroller markers aren't exposed on the instance, but every marker of one trigger
// shares a `marker-<animation id>` class, so they're findable from the start marker's siblings.
function scrollerMarkers(node) {
  const key = [...node.classList].find((c) => c.startsWith("marker-"));
  if (!key || !node.ownerDocument) return [];
  return [...node.ownerDocument.querySelectorAll(`[class~="${key}"]`)].filter((n) =>
    n.className.includes("gsap-marker-scroller-"),
  );
}

// Called with the built tweens/timelines for one animation; only those carrying a ScrollTrigger
// with markers enabled are touched, so a page without markers pays nothing.
export function decorateMarkers(built, title) {
  if (!title) return;
  (built || []).forEach((anim) => {
    const st = anim?.scrollTrigger;
    if (!st || !st.vars?.markers) return;
    decorate(st.markerStart, title, "start", false);
    decorate(st.markerEnd, title, "end", false);
    const node = st.markerStart || st.markerEnd;
    if (!node) return;
    scrollerMarkers(node).forEach((m) =>
      decorate(m, title, m.className.includes("scroller-start") ? "start" : "end", true),
    );
  });
}
