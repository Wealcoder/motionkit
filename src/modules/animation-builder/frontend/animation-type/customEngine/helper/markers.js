// Restyle ScrollTrigger's debug markers into a MotionKit badge carrying the animation's name,
// so a page with several scroll animations is readable instead of four identical green/red bars.
//
// GSAP owns the marker's geometry (position/top/right/width/transform) and repositions it on
// every refresh — so nothing here touches those. The outer node keeps its box and its border,
// which is the line marking the exact scroll position; the badge is an inner pill.

// mkOverlayLogo.png from the editor with its floating top dot removed and cropped to the mark,
// inlined so the preview iframe and a published page both render it without a plugin-URL lookup.
const LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA2CAYAAACBWxqaAAADnUlEQVR4nMXaPWgTYRzH8d9zTS4mJhojqNWqEScRa3Bw8AXSRXHTzU3r4qiCi4O0RZBOvozq0BYEX5YqvqEVG5CK+EJSqFZQ6YHUaOPLmcSkubw8DubRqmm93P2fux90C5fvp0nJpXcM9R0d/Bpfv9TfFfK1xHweFq5xaOlsOZF4q/dc7mzV4MJ2902E921acqi91bd/gZ9F80ZNny4j9aVYOrJ1TTD164G99/KHboxW+PCrWqOfib6RfMzp+L196eizd6Ukb7BMrsovjHzvAgB2fsSItQaVZNCnzHowo8L199+KHZ1bZ6glxx/bsXi4fbk3OttjCgbHqQffOpSQitNzxQOA6mHh5Qv9w068EmbiASCgMuxc5+9SvAozFSUQJ29nd5PV/jWz8WLRiDem+DwsbPYJVA8Lb1gRGOy5md9nq7TBmo0HAMYQnvu902BBn4JNK+f1UyKsxIs1DQAxwk48rAIwA3HiVq7L6jHsxsMOAHXE5mig2wqCIh52AQCgtrCmEVTxoACgSQRlPKgAqCO2rZ3ffelpeVYEdTwoAWLLQi0NETLiIQOABghZ8QDgoT6gWB2B62OfBmTFAwC7MVrh/zuZs7pcqYpVEa5vbPOaPl1pZp/yNTlvIdTjV0Y4ZMWLSQGI+FibV8bh/xg5wMl4UAOcjgclwI14UAHcigcVIBKsuRIPig+yyHyO9jaVpsbCbL8CC/ycpsTibAMURhNi+fntHkD1uCuwDZj4XKUpsTjbgKksQ8Fw7+/ANmDhvBbceVF2DUHyObA44HUNQXYq4RaC9GTODQT56bTTCClfaJxESPtK6RRCGgAAQqpHv/K8cFYmQhpAXFc7sCV4+OKT7z2yEFIApQrXZl4UPLg91C0LQQ4oVbg2/s7454qmLAQpQMQf2eVveGFcBoIM8L94MWoECSA7XTMVL0aJsA2Y1A1tMJkxHS9GhbAFmNQN7f74145+izeDUCAsA+zGi9lFWAJM5SopingxO4imAa8zRurO2CRZvJgVRMHgUIrlmumQ1xkj9ehNuqO/c41uNXSuNYvweZimlKt8wMyDZceLNYMY/2gklKGXhTOTennOV0H7YiSciBczg/iYrWoDI3oPAGB/Xzo68LiU/Pt2s7tjVX71iXHGiehGO/cw153JVf+55Wz8Q3l4MFmMAsAf/1Y7PZSLB1QlzpmyOqCy0ZfpYqp3z6KEWwDUf7kH4+E4w88bs4ZeFa8d3/W76QekE3JSLlhi3AAAAABJRU5ErkJggg==";

const STYLE_ID = "motionkit-marker-style";
// Editor design token --accent. Start and end share one chip design; the label tells them apart.
const ACCENT = "#2c76e6";
const MAX_TITLE = 20;

const MARKER_CSS = `
/* GSAP pins the scroller markers to a fixed 149px box; direction:rtl makes a wider pill spill
   leftward into the page instead of off the right edge, without touching that geometry. */
.mk-mk{background:none!important;border-width:0!important;
 padding:0!important;font-size:0!important;line-height:0!important;direction:rtl!important}
/* clip-path draws the arrow, so no border-radius and no box-shadow (a shadow would be clipped
   off by the same path). An element marker points RIGHT, toward the line it marks; the padding
   on that side keeps the chip clear of the tip. */
.mk-mk__pill{direction:ltr;display:inline-flex;align-items:center;gap:5px;vertical-align:bottom;
 flex-direction:row-reverse;margin:2px 6px;padding:2px 9px 2px 2px;
 clip-path:polygon(0 0,calc(100% - 7px) 0,100% 50%,calc(100% - 7px) 100%,0 100%);
 background:rgba(15,16,21,.92);
 font:600 10px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
 color:#f4f4f5;letter-spacing:.01em;white-space:nowrap;backdrop-filter:blur(6px)}
.mk-mk__logo{width:11px;height:11px;flex:none;object-fit:contain;display:block}
/* Not align-self:stretch — the chip shares the same centre line as the logo and the name. */
.mk-mk__role{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;
 padding:2px 5px;display:flex;align-items:center;line-height:1;background:${ACCENT};color:#fff}
/* Scroller markers sit at the viewport edge, so theirs mirrors: point and logo on the left. */
.mk-mk--scroller .mk-mk__pill{background:rgba(15,16,21,.62);color:#d4d4d8;font-weight:500;
 flex-direction:row;padding:2px 2px 2px 12px;
 clip-path:polygon(0 50%,7px 0,100% 0,100% 100%,7px 100%)}
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
