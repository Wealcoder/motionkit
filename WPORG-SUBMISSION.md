# WordPress.org Submission — Rules, Common Rejections, and This Plugin's Status

Tracks wp.org Plugin Directory requirements relevant to MotionKit, plus the live
findings from the pre-submission audit. Goal: pass review on the first attempt.

References:
- Detailed plugin guidelines: https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/
- Escaping: https://developer.wordpress.org/apis/security/escaping/
- Plugin Check tool (PCP): https://wordpress.org/plugins/plugin-check/ — run this locally before every submission/update.

---

## Rules that most commonly sink a first submission

1. **readme.txt / plugin header / version must all agree.** Same plugin name,
   same version number, correct `Stable tag`, `Requires at least`, `Tested up to`,
   `Requires PHP`. Reviewers and the automated scanner diff these.
2. **No placeholder URIs.** `Plugin URI` / `Author URI` must be real, working
   URLs — never `your-username` or example.com placeholders.
3. **Function/class/constant prefixes must be ≥4 characters** and unique
   (100k+ plugins on wp.org — two/three-letter prefixes collide constantly).
   Namespaced PHP (PSR-4, no bare global functions) satisfies this by
   construction and is the preferred pattern. Hooks, options, JS globals, and
   any remaining global-scope constants still need the long prefix even inside
   a namespaced plugin.
4. **Only ship runtime files.** php, js, css, txt, md (readme only), json, xml,
   png/svg/jpg. No `node_modules`, no `src/` (pre-build JS), no build configs
   (`webpack.config.js`, `jsconfig.json`), no `.env`, no lockfiles, no internal
   docs (CLAUDE.md, flow.md, USAGE.md, DEVELOPER.md), no `.git*`. Use a
   `.distignore` + `wp dist-archive` (or manually curate the SVN `trunk/`) so
   the shipped ZIP only contains what the plugin needs to run.
5. **No obfuscated/unreadable code.** Minified build output from a normal
   bundler (webpack/Terser) is fine. Hand-obfuscated PHP, base64-wrapped
   `eval()`, etc. is not.
6. **External service calls must be disclosed.** Any `wp_remote_get/post` to a
   third-party domain (including your own SaaS) needs to be called out in
   readme.txt — what it sends, when it fires, and that it's opt-in if it is.
7. **Bundled JS libraries need compatible licenses.** GPL-compatible (MIT,
   BSD, etc.) only. GSAP core is MIT; several GSAP *plugins* (SplitText,
   MorphSVG, DrawSVG, MotionPath, etc.) were historically Club GreenSock-only
   and can't be redistributed under a non-compatible license — as of GSAP
   v3.12 GreenSock made the whole set MIT, but don't assume; check the
   specific pinned version. Either way: don't bundle third-party CDN URLs for
   paid tiers, and don't hardcode a specific CDN as the *only* source without
   disclosing it.
8. **No misleading / non-functional features.** A "License" or "Pro" tab that
   accepts any input and locally flips a flag to "active" without validating
   anything is treated as deceptive — remove it or make it real.
9. **Standard security three-pillar model everywhere:** sanitize input early
   (`sanitize_text_field`, `wp_unslash`, `absint`, etc.), authorize
   (nonce + `current_user_can` for admin actions; `permission_callback` for
   REST), escape output late (`esc_html`, `esc_attr`, `esc_url`,
   `wp_json_encode`). Every PHP file needs an `ABSPATH` (or
   `WP_UNINSTALL_PLUGIN`) guard, including auto-generated ones.
10. **Uninstall must clean up** everything the plugin created (options,
    transients, user meta) unless you have an explicit reason to keep user
    content — document that reason in readme.txt if so.
11. **Submitter's wp.org account email must match the plugin's claimed domain.**
    Reviewers verify ownership largely via email domain vs. the `Plugin URI` /
    `Author URI` / website named in the plugin. A generic gmail.com (or similar)
    account submitting a plugin tied to a branded domain gets challenged and
    the review stalls until resolved (change account email to that domain,
    transfer to the right account, or prove affiliation). **For MotionKit**:
    submit under a wp.org account whose email is on the `motionkit.io` domain
    — do not use a personal/gmail address. If multiple plugins share an owner,
    they should all live under the same wp.org account.
12. **Don't mix unrelated products under one account without consistency.**
    If the same wp.org account owns multiple plugins for different products/
    brands, each plugin's name, URIs, and disclosed services must independently
    check out — a reviewer finding one plugin non-compliant increases scrutiny
    on the others under the same account.
13. **No remote-loaded files unless it's genuinely a service.** Don't offload
    JS/CSS/images/fonts your plugin needs to function to a remote host (your
    own server or a CDN) instead of bundling them — this applies even if the
    *user* supplies the remote URL, not just if you hardcode it. Permitted
    exceptions are things that are inherently a service: API calls back to a
    server to process data (Akismet-style), oEmbed to a provider (YouTube/
    Twitter), offloading a discussion thread (Disqus), font families from a
    GPL-compatible CDN (Google Fonts). A required client-side animation
    library is not naturally in that "service" bucket just because the URL is
    admin-configurable — expect a reviewer to push back on "the plugin needs
    this remote script to render" regardless of who supplied the URL string.
14. **External service disclosure must be thorough and literal.** Every
    external call — including ones buried in minified/bundled JS, not just
    PHP — needs a readme.txt `== External services ==` section per call site:
    what the service is, what triggers the call and what data goes out, and
    working links to that service's actual ToS + privacy policy (reviewers
    click these; dead links fail review same as missing disclosure).
15. **Admin menu placement should respect the core hierarchy.** Don't force a
    low/attention-grabbing `add_menu_page()` position (e.g. `2`-`10`, ahead of
    Dashboard/Posts). Prefer a submenu under Settings/Tools
    (`add_options_page()`/`add_management_page()`) unless a dedicated
    top-level page is genuinely warranted; if so, use a modest position
    (WordPress core reserves separators around 4/59/100 — landing near one of
    those, not shoving above core items, is the safe zone).
16. **Escape late, not early — and use the right function for the content
    type.** Sanitize on the way in (storage-safe), escape on the way out
    (display-safe) — the two are not interchangeable, and a value sanitized at
    save time still needs escaping at every place it's echoed later. Use
    `esc_html()` only for plain text — it strips HTML, so **never** use it to
    output markup you want rendered. For trusted HTML output use
    `wp_kses_post()` (post-content-safe tag set) or `wp_kses()` with an
    explicit allowed-tags array. A function that builds JSON/HTML for an API
    response should `return`/`wp_send_json()` it, not `echo` — echoing is for
    human-facing screen output only.
17. **Generic/reserved-prefix names are a rejection trigger even for a single
    stray identifier.** Every function, class, `define()`, namespace, and
    `update_option()`/`register_setting()`/`add_shortcode()` key must use a
    ≥4-character, plugin-specific prefix. Never prefix with `__`, `wp_`, or a
    single `_` — those are reserved for WordPress core and will collide.
    `if (!function_exists('name'))` guards around plugin-defined functions are
    a red flag (implies expecting collisions) except in genuine shared
    libraries — don't use them to paper over generic naming.

---

## MotionKit-specific audit findings (as of 2026-08-02)

### Confirmed blockers — must fix before submitting

- [x] **readme.txt rewrite — VERIFIED CURRENT (2026-08-04).** No longer
  stale: correct "Motionkit – Visual Animation with GSAP for WordPress"
  identity, `Stable tag: 1.5.1` matching every other version source, a real
  `== External services ==` section disclosing every `editor.motionkit.io`
  call (connect/token-exchange/session-launch/verify/disconnect — what's
  sent, when, and why), a real `1.5.1` changelog entry (no fabricated
  history), and no `== Screenshots ==` section claiming files that don't
  exist (the section was removed entirely rather than left dangling). This
  checklist item was stale itself — the rewrite had already happened by the
  time of this verification pass.
- [x] **Version mismatch — FIXED (2026-08-02).** All 4 sources now agree on
  `1.5.1`: `readme.txt` Stable tag, `motionkit.php` header, `MOTIONKIT_VERSION`
  constant, `package.json`. Also synced the dev-only `phpstan-bootstrap.php`
  stub and bumped `readme.txt`'s stale `Tested up to: 6.8` → `6.9` to match
  the plugin header. Note: `readme.txt`'s `== Changelog ==` still only has a
  fabricated `1.0.0 - 2024-01-01` entry with invented bullet points and no
  `1.5.1` entry — wp.org's scanner checks that the Stable tag has a matching
  changelog entry, so this still needs a real changelog written as part of
  the full readme.txt rewrite (see next item).
- [x] **Placeholder URIs — already resolved**, `Plugin URI`
  (`https://motionkit.io`), `Author URI`
  (`https://profiles.wordpress.org/wealcoder/`), and readme.txt's `License URI`
  are all real, live URLs. No placeholder text found anywhere in shipped files
  (the one `example.com` hit is in `phpstan-bootstrap.php`, a dev-only stub
  excluded from the ZIP via `.distignore`).
- [x] **License tab — RESOLVED, this checklist entry was stale (verified
  2026-08-05).** The fake `handle_license_activation()` flow described here
  (accepts any string, no server-side check, "Activate Animation Addons Pro"
  copy) **no longer exists anywhere in the codebase** — confirmed via a
  repo-wide search for `handle_license_activation`, `license_key`, and the
  old copy string, zero matches. There is also no separate navigable
  "License" tab; `render_license_tab()` in `ConnectPage.php` is a private
  method embedded inside the **Connect** tab (`render_connect_tab()` calls it
  right after `render_connected_state()` when the site is connected) — its
  name is just an internal method label, not a UI tab. It renders real data
  end to end: `LicenseStatus::get_state()` / `LicenseStatus::is_valid()`,
  which come from the actual billing.local-backed entitlement flow (status,
  plan name, sites used/limit, expiry, "last checked", and the stale-outage
  notice added earlier this session) — no local flag-flipping, no
  unvalidated input acceptance anywhere in this path.
- [ ] **Non-runtime files would ship in a naive ZIP**: `.env.example`,
  `package-lock.json`, `jsconfig.json`, `webpack.config.js`, `node_modules/`,
  `src/`, `scripts/`, `CLAUDE.md`, `README.md`, `USAGE.md`, `flow.md`,
  `.gitignore`. → `.distignore` added at plugin root (2026-08-02); verify with
  `wp dist-archive` before upload that the resulting ZIP only contains
  `assets/`, `includes/`, `languages/`, `index.php`, `uninstall.php`,
  `motionkit.php`, `readme.txt`, `license.txt`.
- [x] **GSAP CDN-loading question — RESOLVED as CDN-with-disclosure
  (verified 2026-08-05).** Checked GSAP's actual current license
  (https://gsap.com/licensing/ + https://gsap.com/community/standard-license/,
  fetched directly, not assumed):
  - GSAP is now free to use in full — including every plugin that was
    formerly Club GreenSock-only (SplitText, MorphSVGPlugin, DrawSVGPlugin,
    etc.) — under Webflow's own **"GSAP Standard No Charge" license**. This
    is **not MIT and not GPL-compatible** — it's a proprietary license
    Webflow retains. So bundling GSAP's source inside this plugin's
    (GPLv2-or-later) codebase is off the table regardless of cost — a
    GPL-compatible-license requirement (rule #7) can't be satisfied by
    bundling a non-GPL library, free or not.
  - The license's "Prohibited Uses" clause bars use in "tools that allow
    users to build visual animations without code that... compete with
    Webflow's visual animation building capabilities." This looked like it
    might block MotionKit outright (a visual animation editor), but the
    license's own FAQ has a question asked verbatim about this exact
    scenario — *"What if a WordPress plugin or theme or other niche tool
    allows users to create GSAP-driven effects through a visual interface?
    Is that prohibited?"* — answered no: Webflow "encourage[s] developers to
    build on top of GSAP, including visual tools that don't directly compete
    with Webflow's rich animation-building capabilities." MotionKit is a
    niche WP animation tool, not a Webflow-competing page-builder platform,
    so this doesn't block MotionKit under Webflow's own license — a separate
    question from the wp.org GPL-compatibility issue above, which still
    applies regardless.
  - **Decision**: keep the CDN approach (already DB-driven per the earlier
    `register_required_script()` rewrite — no hardcoded URL in PHP anymore), and
    write a thorough, explicit disclosure rather than attempt to bundle.
    **Done**: `readme.txt`'s "Does this plugin load GSAP?" FAQ and
    `== External services ==` section rewritten (2026-08-05) to (a) correct a
    factually wrong claim that GSAP loads from "Motionkit's own
    infrastructure" — the real default is the public jsDelivr CDN
    (`cdn.jsdelivr.net`), confirmed against `gsapPlugin.js`'s
    `GSAP_CDN_BASE` in the editor repo — and (b) add a dedicated "Why GSAP
    isn't bundled with this plugin" paragraph naming Webflow as the license
    holder, the license's non-GPL status, and the reasoning for CDN-loading
    instead of bundling. This is the bring-your-own-license framing rule #13
    calls for; expect a reviewer may still ask questions, but the disclosure
    is now accurate and complete rather than the previous mismatch between
    docs and actual behavior.

### Naming inconsistency — RESOLVED (2026-08-02)

- Previously: three coexisting naming schemes (`motionkit_*`/`MOTIONKIT_*`,
  `wcf_animation_builder_*`, `wcf_anim_builder_*`) plus the PHP namespace
  itself (`WcfAnimationBuilder\`). All were ≥4 chars and non-colliding, so
  never a hard rejection risk, but inconsistent with the plugin being
  submitted/branded as "MotionKit."
- **Fixed**: PHP namespace renamed `WcfAnimationBuilder\` → `MotionKit\`
  (24 files); option keys `wcf_animation_builder_options/version/creation_date`
  → `motionkit_options/version/creation_date`; activation/deactivation hooks
  `wcf_animation_builder_activated/deactivated` → `motionkit_activated/deactivated`;
  the Pro-addon filter `wcf_animation_builder/frontend/presets/enqueue_element_scripts`
  → `motionkit/frontend/presets/enqueue_element_scripts`; AJAX actions
  `wp_ajax_wcf_anim_builder_configs_delete`/`_gl_configs_delete` →
  `wp_ajax_motionkit_configs_delete`/`_gl_configs_delete`; nonce name
  `wcf-admin-preview-nonce`/`wcf_nonce` → `motionkit-admin-preview-nonce`/
  `motionkit_nonce`; JS global `wcfanimb` → `motionkitData` (both
  `wp_localize_script` call sites in `Frontend.php`, the inline JS in
  `ScrollSmoother.php`, and every read/write across `src/` —
  `editor-bridge.js`, `frontend.js`, `isPreviewMode.js`, `scrollParallax.js`,
  `scrollVideoFrame.js`, `device.js`); the `wcfanimb-skip-selector-full` CSS
  class → `motionkit-skip-selector-full`. All PHP syntax-checked and
  PHPStan-clean after the rename (baseline regenerated, same 7 pre-existing
  findings, none new/fixed by the rename itself). Fixed a latent bug found
  along the way: `Plugin::should_skip_init()`'s AJAX substring gate checked
  for `'wcf_animation_builder'`, which never matched the real action names
  (`wcf_anim_builder_*`) even before this rename — now checks `'motionkit_'`.
- ~~The 26 `wcf-mk-*` preset keys~~ — **RENAMED on the WordPress side**
  (2026-08-02) to `motionkit-mk-*`, in both
  `includes/Common/configs/animation-builder-assets.php` (all 26 config
  keys) and every preset module's `PRESET_KEY` JS constant under
  `src/modules/animation-builder/frontend/animation-type/preset/` (26
  files, verified pairwise against the config). Also renamed the adjacent
  `data-wcf-mk-step-id` DOM attribute → `data-motionkit-mk-step-id`
  (`tagTargets.js`, `resetAllAnimations.js`) since it's the same naming
  family and purely internal.
  **Data migration added**: `includes/Migrations/PresetKeyMigration.php`
  (sentinel `motionkit_preset_key_migrated`, same idempotent pattern as
  `SettingsKeyMigration`) — scans `motionkit_global_animations` and every
  `mkit_pg_animation_<type>` row (post_meta/term_meta/option) for animation
  entries whose `presetKey` field still holds an old `wcf-mk-*` value and
  rewrites it to `motionkit-mk-*` in place, so animations saved before this
  rename keep matching their preset script after it. PHPStan-clean.
  **⚠️ REQUIRES the matching prefix change in the editor.motionkit.io /
  motionkit-editor codebase** (the editor is what writes `presetKey` values
  into saved animations in the first place) — user is applying that
  separately.
  - ~~The postMessage `type` strings `wcf-animation-config` /
    `wcf-animation-config-reset`~~ — **RENAMED on the WordPress side**
    (2026-08-02) to `motionkit-animation-config` /
    `motionkit-animation-config-reset`, matching every other message in the
    contract. Updated: `frontend.js` (comment + both `event.data.type`
    checks), `scrollParallax.js`, `resetAllAnimations.js` (comment),
    `CLAUDE.md`'s postMessage table. **⚠️ REQUIRES a matching change in the
    editor.motionkit.io / motionkit-editor codebase** — the SaaS must send
    the new type strings, or live animation preview inside the editor will
    silently stop updating (the WP-side `if` checks will simply never
    match the old strings anymore). Coordinate before this ships.
  - `wcf-custom-fonts`, `wcf-addons-template`, `wcf-addons-popup`,
    `wcf-code-snippet`, `wcf-custom-icons` in `RestApi.php`'s
    `search_pages()` exclusion list — **not actually a MotionKit identifier
    at all**: these are hardcoded custom-post-type slugs registered by the
    separate "Animation Addons for Elementor" plugin. Renaming these would
    silently break the page-search exclusion filter unless that entirely
    separate plugin is also renamed. Do not touch.

### Second naming-inconsistency pass — RESOLVED (2026-08-04)

A follow-up full-codebase prefix audit (function/constant/option/hook/CSS-class
scan) found six more WCF-era or unprefixed identifiers the first pass missed —
all fixed, `npm run build` re-run to sync the compiled output into
`motionkit-editor`'s `server/static/animation-scripts/` (see the build
pipeline note below), live-tested on `development.local` afterward (License
tab regression check still passes; front-page console-error check shows one
pre-existing, unrelated `ScrollToPlugin is not defined` warning — caused by
this dev site's GSAP CDN settings not including `ScrollToPlugin.min.js`, not
by this rename).

- **`data-wcf-anim-id`** (highest-volume leftover, 30 files, ~50 occurrences
  across every preset module + `customEngine/cleanup.js`/`ownership.js` +
  `lib/resetAllAnimations.js`) → **`data-motionkit-anim-id`**. This is a
  shared DOM-attribute contract with `motionkit-editor`'s compiled animation
  runtime (`server/static/animation-scripts/`, itself a **build artifact
  copied from this plugin's `assets/build/`** via
  `scripts/copy-to-editor.js` — not a separately-maintained codebase, so
  re-running `npm run build` here was sufficient to propagate the rename;
  no manual edits needed on the editor side).
- **`wcf-ab-pin-end-selector-26`** → **`motionkit-pin-end-selector-26`**,
  in both `includes/Frontend/ScrollSmoother.php:59` (PHP, sets the class) and
  `headerStickyAnim.js:119` (JS, reads it as a default selector) — these two
  must always match; verified both updated together.
- **`wcf-free-ab-`** / **`wcf-free-ab-init-style-props`** →
  **`motionkit-free-ab-`** / **`motionkit-free-ab-init-style-props`**
  (`lib/resetAllAnimations.js`'s `FREE_CLASS_PREFIX`/`FREE_INIT_STYLE_CLASS`
  constants).
- **`.license_key`** (admin.css, 3 rules — unprefixed, generic CSS class name,
  a real wp.org collision risk) → **`.motionkit-license_key`**. No PHP
  template actually applies this class anywhere in the codebase (confirmed
  via repo-wide search) — it's orphaned CSS left over from the same legacy
  fake License tab flagged as a confirmed blocker above; renamed rather than
  deleted since the tab's fate (remove/rewire/rewrite) is still an open
  decision and this rename is harmless either way.
- **Dead `WCF_ANIMATION_BUILDER` global references (two functions, not one)**
  — `lib/utils.js` had **two** dead functions reading a global that was
  never localized anywhere in this codebase (only `motionkitData` is), even
  before the MotionKit rename: `getResponsiveAndBelow()` (caught in the
  first pass) and `getScreenSize()` (missed in the first pass, caught when
  the user spotted the identifier directly in the editor). Both confirmed
  zero callers/imports repo-wide via search, both deleted entirely rather
  than renaming an unreachable reference.
- **Stale `@package` tags / product-name constant**: `index.php:5`'s
  `@package WcfAnimationBuilder` → `@package MotionKit` (every other file's
  tag was already updated in the first pass; this one was missed);
  `includes/Plugin.php:43`'s `PLUGIN_NAME` constant
  (`'GSAP Animation Builder for WordPress'`, unused anywhere else in the
  codebase) → `'MotionKit'`.
- `CLAUDE.md` no longer references the stale main-file name or namespace —
  both fixed to `motionkit.php` / `MotionKit\`.

### Third pass — `.mk-*` CSS class family → `.motionkit-*` (2026-08-04)

User explicitly asked that CSS classes use the full `motionkit-` prefix, not
the shortened `mk-` — even though `.mk-*` was itself an established,
non-colliding convention (~128 occurrences, first flagged as "confirmed OK"
in earlier passes). Renamed the entire family for brand consistency, not
because it was a collision risk (a 2-letter-plus-hyphen CSS class prefix on
a page scoped to `.mk-page`'s own container is not meaningfully riskier than
`.motionkit-page`, but consistency with the rest of the plugin's naming was
the actual ask).

- **360 replacements across 3 files**: `src/css/admin.css` (98),
  `src/css/admin-tools.css` (34), `includes/Auth/ConnectPage.php` (228 — the
  template that applies these classes in markup). All `.mk-*` classes (page
  shell, header, sidebar, cards, badges, buttons, forms, notices, etc.)
  renamed to `.motionkit-*`.
- **Explicitly NOT touched, verified by name/pattern before running the
  rename** (renaming these would have been wrong):
  - `motionkit-mk-*` (the 26 preset-key identifiers renamed in an earlier
    session, `animation-builder-assets.php` + every preset's `PRESET_KEY`
    JS constant) — already correctly `motionkit-`-prefixed; `mk-` here is a
    sub-token, not a class-boundary prefix.
  - `data-motionkit-mk-step-id` (the DOM attribute paired with the preset
    keys, `tagTargets.js`/`resetAllAnimations.js`) — same reasoning.
  - `mkit_pg_animation_*`/`mkit_pg_settings_*` (option/meta-key prefix
    family, `ConnectPage.php` `TOOLS_OPTION_PREFIX`/`TOOLS_SETTINGS_PREFIX`)
    — `mkit_` has no hyphen after `mk`, a structurally different token that
    the rename pattern (`\bmk-` with a required hyphen) never matched.
    **Since renamed to `motionkit_pg_animation_*`/`motionkit_pg_settings_*`
    in a later pass (2026-08-06)** — see the naming-consistency note below;
    no longer left as-is.
  - `mk-preview-` (a `localStorage` key in `frontend.js:241`, used for
    passing preview data through a URL `session` param) — not a CSS class,
    no shared-namespace collision risk the way a CSS selector has (scoped to
    the browsing origin); left as a separate, not-yet-decided item — flag
    for a future pass if the user wants full consistency there too.
  - An inline SVG gradient `id="mk_hdr_g"` in `ConnectPage.php`'s header
    logo markup — uses an underscore, not a hyphen, so it never matched the
    `\bmk-` pattern; also a locally-scoped SVG def, not a class, so not a
    wp.org concern regardless.
- Verified via a regex dry-run against sample strings before running the
  real rename (confirmed `.mk-page`/`.mk-notice` match while
  `motionkit-mk-*`/`mkit_pg_*` don't), then a repo-wide `\bmk-[a-z]` sweep
  after the rename confirmed zero remaining matches in all three target
  files. `npm run build` re-run to compile + sync to
  `motionkit-editor`'s static dir (unaffected here since none of the
  synced animation-runtime files reference these admin-UI classes — this
  rename is WP-admin-only). Live-verified on `development.local`: License
  tab renders pixel-identical to before (screenshot-compared), computed
  `background-color` on `.motionkit-header` resolves correctly
  (`rgb(255, 255, 255)`), zero elements in the rendered DOM still carry an
  `mk-`-prefixed class, zero console errors.

### Fourth pass — `mkit_pg_*` → `motionkit_pg_*` option/meta-key prefix (2026-08-06)

The per-page animation/settings storage key prefix (`mkit_pg_animation_*` /
`mkit_pg_settings_*`) was flagged as inconsistent with the rest of the
plugin's `motionkit_*` option-key convention — `mkit_` is a valid, unique,
≥4-character prefix (never a wp.org collision risk on its own), but it read
as a leftover from an earlier naming scheme once every other option key had
already been renamed to `motionkit_*` in the first naming-consistency pass.

**Decision**: full rename, no back-compat shim. MotionKit has not shipped a
public release yet, so there's no installed-site data in the old key shape
to migrate — unlike the `SettingsKeyMigration`/`PresetKeyMigration` classes
from the first two passes (both **since removed**, along with the
`includes/Migrations/` directory entirely — same reasoning: nothing to
migrate pre-release, so the migration machinery was dead weight once the
option-key rename made a genuinely first-run key shape the only one that
will ever exist in the wild).

- **Source of truth**: `MotionkitBuilderPageType::$option_name` (was
  `'mkit_pg_animation_'`) → `'motionkit_pg_animation_'`. Every other file
  either reads this property directly or derives the settings variant from
  it via `EditorSessionTrait::settings_config()`'s regex swap (updated to
  match the new prefix), so this was the only place holding a literal that
  needed to change to fix the shape everywhere downstream.
- **Also updated**: `ConnectPage.php`'s `TOOLS_OPTION_PREFIX`/
  `TOOLS_SETTINGS_PREFIX` constants (used by the Tools tab's bulk-delete and
  cascade-delete logic — `$wpdb->esc_like()` LIKE-query prefix matching,
  `substr()` suffix extraction), `ScrollSmoother.php`'s prefix-swap
  `str_replace()`, and every doc-comment across `Frontend.php`, `RestApi.php`
  referencing the literal old prefix.
- **Docs synced**: `CLAUDE.md`'s wp_options table, `motionkitData` shape
  sample, REST payload example, and Security Rules bullet all updated to the
  new prefix; the `SettingsKeyMigration`/`PresetKeyMigration` sections and
  their `Migrations/` file-tree entries removed entirely (dead — the classes
  no longer exist). Also caught two unrelated already-stale bits in the same
  pass: `mk_token` → `motionkit_token` (the `motionkitData` JS field never
  actually had an `mk_` prefix in real code, doc just hadn't caught up to an
  earlier rename) and `wcf-admin-preview-nonce` → `motionkit-admin-preview-nonce`
  in the same sample block. `USAGE.md`/`flow.md` (dev-only, excluded from the
  shipped ZIP via `.distignore`) updated too, for consistency.
- Verified: repo-wide `mkit_pg_animation_|mkit_pg_settings_` sweep after the
  rename found zero remaining matches in any `.php` file; `php -l` and
  `phpcs` clean on every touched file; live-tested on `development.local`
  with a fresh page save/load round-trip (no pre-existing data to migrate,
  so a clean write-then-read under the new key was the correct verification,
  not a migration check).
- **Missed spot found later via full E2E (Playwright) regression, fixed
  same day**: `EditorSessionTrait.php:142`'s `is_valid_page_type_config()` —
  the security check that confines editor-session writes to MotionKit's own
  key shape — still matched the literal string `'mkit_pg_'` (substring, not
  even the full old prefix). Since `'motionkit_pg_animation_...'` doesn't
  contain `'mkit_pg_'` as a *leading* substring (`strpos(...) !== 0` — the
  string starts with `'motionkit_pg_'`, not `'mkit_pg_'`), this check
  **rejected every real post-rename payload**, breaking
  `save_current_page_animation`/`save_current_page_settings`/
  `delete_current_page_settings` entirely (global settings/animations,
  which don't go through this validator, still worked — that's why it
  wasn't caught by the live DB round-trip test above, which happened to
  exercise a path that didn't hit this specific check the same way).
  The original repo-wide `mkit_pg_animation_|mkit_pg_settings_` grep sweep
  missed this because the literal in the code was `'mkit_pg_'` (no
  `animation_`/`settings_` suffix — this method checks the shared prefix
  before either variant), not the two exact patterns that sweep searched
  for. **Fixed**: `'mkit_pg_'` → `'motionkit_pg_'`. Verified live via 3
  direct REST calls: (1) new-prefix payload → `200`, confirmed actually
  persisted in `wp_options`; (2) old-prefix payload → `400
  invalid_page_type_config`, confirming the security boundary itself is
  intact, not just permissive now; (3) an unrelated option name
  (`siteurl`) → `400`, confirming the check still rejects genuinely
  out-of-scope keys.

### Fifth pass — Plugin Check (PCP) live scan (2026-08-06)

Ran the official Plugin Check scanner against the working directory. Real,
actionable findings and fixes:

- **Trademark: plugin name contained "WordPress"** — wp.org's naming policy
  disallows "WordPress" anywhere in a plugin's display name, no exceptions.
  Both `readme.txt`'s `=== ... ===` title and `motionkit.php`'s `Plugin Name:`
  said "Motionkit – Visual Animation with GSAP for WordPress" → renamed to
  "Motionkit – Visual Animation with GSAP" in both places. (Historical
  references to the old name elsewhere in this doc's earlier dated passes are
  left as-is — they're a record of what the name was at that point in time.)
- **`Tested up to` had a patch version** — wp.org only accepts `major.minor`
  for this header (e.g. `7.0`, never `7.0.2`). Had been set to `7.0.2` in an
  earlier pass to match WordPress.org's actual current release number, which
  was the right *version* but the wrong *granularity* — fixed to `7.0` in
  both `readme.txt` and `motionkit.php`.
- **`ConnectPage.php:737`** — `$_POST['_wpnonce']` was passed straight into
  `wp_verify_nonce()` without `wp_unslash()`/sanitization first. Low
  functional risk (nonces are alphanumeric, unaffected by magic-quotes
  slashing in practice) but a real gap against the sanitize-input pattern
  used everywhere else in this file — fixed to sanitize+unslash before the
  `wp_verify_nonce()` call, matching the pattern already used for every other
  `$_POST`/`$_GET` read in this class.
- **Stray duplicate file**: `scripts/copy-to-editor copy.js` (space in the
  filename — an accidental OS-level copy of `copy-to-editor.js`, an older,
  hardcoded-path version of the same script vs. the current `.env`-driven
  one). Unreferenced anywhere, dev-only (`scripts/` already excluded via
  `.distignore`), deleted.
- **`phpstan-bootstrap.php` stale version**: still said `1.5.1` after the
  `1.0.0` version-rename pass — synced. (PCP's separate "missing ABSPATH
  guard" flag on this file was **not** acted on: this is a dev-only PHPStan
  CLI stub that fakes plugin constants for static analysis, never included by
  a real WP request, and already `.distignore`d — adding an ABSPATH check
  would be following the rule's letter against a file the rule doesn't
  actually apply to.)

**Findings investigated and NOT changed** (confirmed false-positives for this
scan mode, not real defects):

- `.env`, `.env.example`, `phpcs.xml.dist`, `.distignore`, `.gitignore`,
  `.claude`, `.github`, `CLAUDE.md`, `flow.md`, `USAGE.md`,
  `WPORG-SUBMISSION.md` — PCP scans the raw working directory, not the
  `.distignore`-filtered dist ZIP. Confirmed (Third pass, "GitHub Actions CI"
  section below, and independently re-checked this pass) that every one of
  these is already listed in `.distignore` and would not ship. Re-verify with
  an actual `wp dist-archive` build before the real upload, per the
  pre-submission checklist below.
- All `WordPress.Security.NonceVerification.Recommended` warnings (~40+
  across `ConnectPage.php`/`OAuthHandler.php`/`Frontend.php`/
  `ScrollSmoother.php`) — every flagged read is a display-only `$_GET` flag
  (active tab, error message, connected/disconnected banner state) with no
  state-changing side effect; nonce verification protects actions that
  *change* something, not read-only navigation params. Already
  individually verified and excluded in this project's own `phpcs.xml.dist`
  (see the "wp.org standard" section below) — PCP just doesn't honor that
  local ruleset since it runs its own fixed one.
- `WordPress.DB.DirectDatabaseQuery.*` warnings on the Tools tab bulk-delete
  queries and `uninstall.php` — all use `$wpdb->prepare()` correctly; these
  are one-shot admin-triggered/uninstall-time queries, not hot-path reads
  that would benefit from `wp_cache_*` wrapping.
- `Plugin.php:197` — `PreparedSQL.InterpolatedNotPrepared` /
  `PreparedSQLPlaceholders.UnfinishedPrepare` on
  `maybe_fix_autoload_flags()`'s dynamic `IN ({$placeholders})` clause. The
  sniff can't trace that `$placeholders` is itself built from `%s` tokens
  (`implode(',', array_fill(0, count($hot_options), '%s'))`) sized to match
  the hardcoded `$hot_options` literal — the standard pattern for a
  variable-length `IN (...)` with `$wpdb->prepare()`'s variadic args. Real
  code, not user input; confirmed false-positive same as the equivalent
  finding already excluded in `phpcs.xml.dist` for `ConnectPage.php`'s bulk
  queries. Added a targeted `// phpcs:ignore` on the flagged line (rather
  than another blanket `phpcs.xml.dist` exclusion) since PCP doesn't honor
  that file — verified clean against the *unmodified* `WordPress-Extra`
  standard directly, not just this project's lenient ruleset.
- `PrefixAllGlobals.NonPrefixedVariableFound` on `uninstall.php`'s local
  variables — WP core guarantees `uninstall.php` runs in an isolated,
  single-execution scope; local variable names there can't collide with
  anything.

### Account/ownership — check before submitting

- A separate `wealcoder`-account plugin ("bricksfly") received a real wp.org
  review rejection (2026-08-02 thread) over: gmail.com account email not
  matching its declared `bricksfly.com` domain (ownership unverifiable),
  trademark/naming confusion from "Bricks" + "GSAP" in the display name, dead
  ToS/privacy links in readme.txt, and undisclosed third-party API calls
  (`themecrowdy.com`). That plugin is unrelated to MotionKit (different repo,
  not present in this working directory) but the **ownership-verification
  failure mode is directly relevant**: confirm whichever wp.org account
  submits MotionKit uses a `motionkit.io` email address, not a personal one —
  see rule 11 above. Current session user (`rayhan@motionkit.io`) already
  matches; just make sure the actual wp.org submitter account does too.

### Verified OK — no action needed

- **No obfuscated code.** `assets/build/*` is standard webpack/Terser minified
  output. No `eval()`, no encoded-payload patterns. `base64_encode/decode`
  usage found is all legitimate (JWT segments, AES-256 token-at-rest
  encryption, one inline SVG data-URI icon).
- **External calls are all to `editor.motionkit.io`**, all part of the
  explicit OAuth connect/disconnect/JWT/session-verify flow the admin
  initiates — not silent phone-home. Still needs readme.txt disclosure (see
  blocker above).
- **ABSPATH guards**: present on every real PHP file. The only PHP files
  without a guard are auto-generated `assets/build/**/*.asset.php` webpack
  manifests (pure `return array(...)`, no side effects) — low risk, could add
  a guard anyway for a totally clean PCP scan.
- **Escaping/sanitization**: RestApi.php, OAuthHandler.php, and ConnectPage.php
  are in good shape overall (proper `sanitize_text_field(wp_unslash())` +
  `esc_html/esc_attr/esc_url` + nonce + capability checks throughout). Minor
  nitpicks only: `ConnectPage.php` lines ~131, 136, 653 read `$_POST['_wpnonce']`
  /`$_POST['motionkit_license_action']` without `wp_unslash()` before
  sanitizing (functionally low-risk, just inconsistent with the pattern used
  elsewhere in the same file).
- `/save` REST route uses `permission_callback => '__return_true'` at the
  route level, but `dispatch_simple()` enforces real JWT auth inside the
  handler before doing anything — not an open door, just an unusual pattern
  a reviewer may pause on.
- **Text domain matches slug**: `Text Domain: motionkit` in the plugin header
  matches the `motionkit` slug exactly (verified across all `includes/`
  gettext calls) — no i18n mismatch.
- **Admin menu placement is reasonable**: `ConnectPage::register_menu()` uses
  `add_menu_page(..., 59)` — position 59 sits in WordPress core's own
  separator slot just before Appearance(60), not shoved above Dashboard/Posts
  like the rejection example (position `8`). A dedicated top-level page is a
  legitimate choice here (this is the plugin's primary connect/settings UI,
  not a simple settings form that belongs under Settings/Tools).
- **No unsafe `esc_html()`-on-HTML or missing `wp_kses` usage found**: spot-
  checked `ConnectPage.php`/`Frontend.php`/`RestApi.php` — no place echoes
  HTML through `esc_html()` (which would strip it) or skips escaping where
  markup output is intended. No dynamic/user-influenced HTML block was found
  that would need `wp_kses_post()`/`wp_kses()` and isn't already going through
  one of `esc_html/esc_attr/esc_url`, static literals, or core functions like
  `get_avatar()` that pre-escape their own output.
- **No generic/reserved-prefix names**: no bare global functions, no `__`/
  `wp_`/single-`_` prefixed identifiers, no `if (!function_exists(...))`
  guards found anywhere in `includes/`. All hooks/options/constants use
  `motionkit_`/`MOTIONKIT_`/`wcf_animation_builder_`-style prefixes (see
  naming-inconsistency note above for the mixed-scheme flag, which is a
  cosmetic/reviewer-attention issue, not a collision risk). A follow-up full
  scan (2026-08-04, see "Second naming-inconsistency pass" above) found and
  fixed six more leftover/unprefixed identifiers this note had missed
  (`data-wcf-anim-id`, two more `wcf-*` CSS/class strings, one unprefixed
  `.license_key` CSS class, one dead `WCF_ANIMATION_BUILDER` global
  reference, two stale product-name strings) — none were collision risks in
  practice (JS globals/DOM attributes/CSS classes don't register with WP's
  own function/class namespace the way PHP identifiers do), but the
  `.license_key` CSS class was a genuine unprefixed-selector risk worth
  fixing regardless.

---

## Pre-submission checklist

- [x] Run Plugin Check (PCP) locally — done (2026-08-06), see "Fifth pass"
      above. Real findings fixed (trademark name, Tested-up-to granularity,
      nonce unslash, stray file); dist-scope/NonceVerification/DirectQuery
      findings investigated and confirmed false-positives for this scan mode.
- [ ] Sync version number across readme.txt / plugin header / `MOTIONKIT_VERSION` / package.json.
- [x] Rewrite readme.txt — done, verified current (2026-08-04); still needs
      the `== External services ==` section extended to cover the GSAP CDN
      mechanism once its shape is decided (see GSAP item below — the
      OAuth/connect/disconnect/session calls are already fully disclosed).
- [x] Resolve the GSAP CDN-loading question — resolved 2026-08-05, CDN with
      full disclosure (GSAP's license is non-GPL, can't be bundled; readme.txt
      updated with accurate jsDelivr-CDN disclosure + licensing rationale).
- [x] License tab — resolved, verified current (2026-08-05); real
      billing.local-backed data embedded in the Connect tab, no fake
      activation flow exists.
- [ ] Replace placeholder Plugin URI / Author URI.
- [ ] Confirm the wp.org account used to submit has a `motionkit.io` email,
      not a personal/gmail address.
- [ ] Confirm `.distignore` output via `wp dist-archive` (or manual zip) contains
      only runtime files.
- [ ] Re-run full security/performance review after the above changes land.

---

## Dev tooling (not part of the wp.org submission itself)

### PHPStan (added 2026-08-02)

- `composer.json` (dev-only; `vendor/` gitignored, `composer.lock` tracked for
  CI reproducibility, both excluded from the shipped ZIP via `.distignore`):
  `szepeviktor/phpstan-wordpress` (bundles WordPress core stubs + a PHPStan
  extension) at level 5.
- `phpstan.neon`: scans `includes/`, `motionkit.php`, `uninstall.php`;
  excludes `vendor/`, `node_modules/`, `assets/build/`.
- `phpstan-bootstrap.php`: defines the `MOTIONKIT_*` constants that normally
  come from `motionkit.php`'s own top-level code, so analyzing `includes/` in
  isolation doesn't false-positive on "constant not found."
- `phpstan-baseline.neon`: captures the 7 pre-existing findings as of the
  initial setup (unreachable ternary branches from PHPDoc-certain types, one
  unused private method, one always-false strict comparison, one unreachable
  statement after early return, one return-type mismatch in
  `ConnectPage::collect_animation_records()`). None were fixed yet — chip away
  over time per the skill's baseline workflow, don't add new errors to it.
- Run via `composer run phpstan` (already aliased to `phpstan analyse --debug`).

**Environment quirk on this machine**: PHPStan's parallel worker processes
don't inherit the `PHPRC`/`memory_limit` override used to get PHP's bundled
CLI working (see below) — plain `vendor/bin/phpstan analyse` reliably crashes
with "reached configured PHP memory limit" regardless of `--memory-limit` or
`parallel: maximumNumberOfProcesses: 1` in `phpstan.neon`. `--debug` (which
disables the worker architecture entirely and runs single-process) reliably
works and is now the standing invocation. If this stops being necessary on a
different machine/PHP setup, `--debug`'s per-file progress noise can be
dropped in favor of the cleaner default output.

### GitHub Actions CI (added 2026-08-06)

`.github/workflows/php-ci.yml` — three independent jobs, on push to
`main`/`motionkit-connector` and on PRs touching PHP/config files:

- **`lint`**: `php -l` across every `.php` file (excluding `vendor/`,
  `node_modules/`, `assets/build/`), matrixed across PHP 7.4 (the readme.txt
  floor), 8.2, and 8.3 (forward-compat).
- **`phpstan`**: `composer run phpstan` (level 5, same config as local dev).
- **`phpcs`**: `phpcs.xml.dist` — a deliberately lenient WordPress-Extra
  ruleset, not the strict default. See the `phpcs.xml.dist` inline comments
  for the full reasoning per exclusion; summary:
  - **Formatting-only exclusions** (indentation, brace style, paren spacing,
    array alignment, short-ternary, Yoda conditions, PSR-4 file naming,
    per-class camelCase methods): this codebase uses 2-space indentation and
    a handful of consistent style choices that aren't WPCS defaults.
    Reformatting ~2,400 lines to chase indentation alone wasn't worth the
    diff noise — excluded rather than fought file-by-file. Revisit if the
    project ever standardizes on WPCS's tab/brace conventions.
  - **Verified-safe exclusions** (each checked against the actual code before
    excluding, not rubber-stamped): `NonceVerification` on read-only GET
    tab/notice params (all already sanitized, nonces don't apply to
    non-state-changing navigation); dynamic-IN-clause `$wpdb->prepare()` in
    `Plugin::maybe_fix_autoload_flags()` (sniff can't trace the placeholder
    string through `implode()`, but `%s` is genuinely present); `$wpdb`-style
    silenced-error usage in `Helper::parse_env_file()` (guarded by
    `is_readable()` + explicit `false` check, `@` only suppresses the
    race-condition warning between them); `base64_encode/decode` (JWT
    base64url segments, AES-256 token encryption, one inline SVG icon — all
    confirmed benign, matches the existing "Verified OK" audit note below);
    `$global->gsapPlugin` camelCase (a dynamic stdClass property from decoded
    JSON, its name dictated by the editor's own data shape, not a PHP
    property this codebase declares); `'wordpress'` lowercase (a
    machine-readable API contract value sent to the SaaS's platform-detection
    endpoint, not human-readable prose); hook naming (`motionkit/editor/url`
    style `/`-namespaced hooks and the all-caps `MOTIONKIT_LOADED` — both a
    deliberate, already-documented convention per CLAUDE.md/readme.txt,
    changing either would break existing integrators);
    `RestApi::add_cors_headers()`'s unused `$server` param (required by
    WordPress core's fixed `rest_pre_serve_request` filter signature).
  - **Real findings fixed, not excluded** (same pass, 2026-08-06): two
    `EscapeOutput` false-positives in `Frontend.php`'s preload `<link>` tags
    and `ConnectPage.php`'s button-char animation were restructured to escape
    inline at the `printf`/`echo` site instead of one statement earlier (same
    output, but now verifiable by both the sniff and a human reviewer); a
    hardcoded HTML-entity tab icon switched from raw `echo` to `wp_kses($x,
    [])`; two missing `translators:` comments added for `%d`/`%s` placeholder
    strings; `in_array()` in `MotionkitBuilderPageType` given strict-mode
    `true`; a dead `load_textdomain()` no-op method (and its `init` hook)
    removed entirely — wp.org auto-loads translations from the `Text Domain`
    header since WP 4.6, no manual call needed; stale `[GSAP Animation
    Builder]` log-message branding fixed to `[MotionKit]`; an unused
    `$current_user` parameter removed from the private, single-call-site
    `render_disconnected_state()`.
  - Warnings (currently just the 40 `NonceVerification` false-positives
    above) are surfaced in local `composer run phpcs` output but don't fail
    CI (`--warning-severity=0` in the workflow) — only errors do.
- Confirmed clean end-to-end on 2026-08-06: fresh `composer install` from
  the committed `composer.lock`, `php -l` sweep, `composer run phpstan`
  (no errors), and `phpcs` (exit 0 with warnings suppressed) all pass.

### PHP CLI environment quirk (this machine)

Local by Flywheel's bundled CLI `php.exe` (the one on `PATH`) loads **no
php.ini at all** (`php --ini` shows `Loaded Configuration File: (none)`), so
openssl/curl extensions are disabled by default and Composer can't reach
Packagist. Fixed for this session via a scratch ini (`PHPRC` env var) enabling
`openssl`/`curl`/`mbstring`/`fileinfo` and setting `memory_limit = 3G`. Also
found and fixed: PHP's curl had no CA trust store configured at all, causing
"SSL certificate problem: unable to get local issuer certificate" on any
HTTPS fetch — fixed via `curl.cainfo`/`openssl.cafile` pointing at Git for
Windows' bundled `ca-bundle.crt` (`D:\programs\Git\mingw64\etc\ssl\certs\
ca-bundle.crt`). Composer's **global** config also had `disable-tls: true`
set from before this session (not by me) — re-enabled properly
(`disable-tls: false`, `secure-http: true`, `cafile` pointed at the same
bundle) now that a real CA bundle is available, rather than leaving TLS
verification disabled machine-wide. None of this is project-specific to
motionkit; it's noted here only because it blocked `composer install` for
this repo and will block it again for any other PHP/Composer work on this
machine unless a permanent php.ini fix is applied at the Local/PHP level.
