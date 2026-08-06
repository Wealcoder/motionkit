=== Motionkit – Visual Animation with GSAP for WordPress ===
Contributors: wealcoder
Tags: animation, gsap, scroll animation, page transitions, visual editor
Requires at least: 6.7
Tested up to: 7.0.2
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connects your site to the Motionkit visual editor so you can build GSAP-powered scroll, hover, and page-transition animations without writing code.

== Description ==

Motionkit connects your WordPress site to the [Motionkit](https://motionkit.io) visual animation editor, so you can build GSAP-powered scroll effects, hover interactions, page transitions, and text/image animations without writing JavaScript.

This plugin is the WordPress-side connector: it authenticates your site with the Motionkit editor, stores the animations and settings you create, and renders them on the front end using GSAP. The visual editor itself runs at editor.motionkit.io — you design animations there against a live preview of your actual pages, then Motionkit saves the result back to your site.

= Key Features =

* **Visual animation editor** – Build scroll-triggered, hover, and load-in animations on a live preview of your site, no code required
* **Built on GSAP** – Industry-standard animation engine (GSAP + ScrollTrigger + ScrollSmoother) for smooth, performant motion
* **Per-page and global animations** – Apply animations to a single post/page, a whole post type, or site-wide
* **Ready-made presets** – Text reveals, image hover effects, scroll parallax, cursor effects, and page transitions out of the box
* **Device-aware** – Configure different behavior per breakpoint (desktop, laptop, tablet, mobile)
* **Secure by design** – Signed, single-use session tokens for the editor connection; sanitized input and escaped output throughout
* **Built for performance** – Assets are only enqueued on pages that actually have animations configured

= How it works =

1. Install and activate the plugin.
2. Connect your site to Motionkit from the plugin's admin page (OAuth-style authorization — no manual API keys to copy/paste).
3. Open the Motionkit editor and pick the page you want to animate. The editor loads a live, interactive preview of that exact page.
4. Build your animation visually and save. The plugin stores it on your site and renders it on the front end with GSAP.

= Requires an account =

The visual editor at editor.motionkit.io is a hosted service operated by Motionkit. This plugin is the connector only — building and editing animations happens in that hosted editor, which requires a Motionkit account. See the "External services" section below for exactly what this plugin sends there and when.

== Installation ==

= Minimum Requirements =

* WordPress 6.7 or greater
* PHP version 7.4 or greater
* MySQL version 5.0 or greater

= Installation Steps =

1. Upload the plugin folder to `/wp-content/plugins/` directory, or install directly through the WordPress admin's "Add Plugin" screen.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Go to the "Motionkit" admin menu and connect your site to your Motionkit account.
4. Open the Motionkit editor from the same page to start building animations.

== Frequently Asked Questions ==

= What is Motionkit? =

Motionkit is a visual animation editor for WordPress, built on GSAP. This plugin connects your WordPress site to the hosted editor at editor.motionkit.io so you can design scroll effects, hover interactions, page transitions, and text/image animations without writing code, then save them back to your site.

= Do I need a Motionkit account? =

Yes. The visual editor is a hosted service — you connect your WordPress site to your Motionkit account once, then build animations in the editor against a live preview of your site.

= Does this plugin load GSAP? =

Yes. GSAP (core, ScrollTrigger, ScrollSmoother, and any additional GSAP plugins you enable from the editor's "GSAP Plugin" settings) is loaded from the jsDelivr CDN (cdn.jsdelivr.net) so animations you build in the editor actually run on your site. GSAP is licensed by Webflow, Inc. under its own Standard No Charge license (not GPL) — this plugin does not bundle GSAP's source; it registers a WordPress script dependency pointing at the CDN URL, the same way a theme might load a Google Font. See "External services" below for details, including why GSAP is loaded this way instead of bundled.

= Is the plugin secure? =

Yes. The editor connection uses signed, single-use session tokens rather than long-lived credentials in the browser. All input is sanitized, all output is escaped, admin actions are nonce-protected and capability-checked, and the stored connection token is encrypted at rest (AES-256).

= What happens to my animations if I disconnect? =

Disconnecting revokes the editor's access to your site. Animations and settings you've already saved stay on your site — disconnecting only stops new edits from the hosted editor, it doesn't delete existing content.

== External services ==

This plugin connects to **Motionkit** (editor.motionkit.io), a hosted service operated by Motionkit that provides the visual animation editor. The following calls are made from your WordPress server to editor.motionkit.io:

* **Connect (OAuth authorize)** — When you click "Connect" in the plugin's admin page, your browser is redirected to editor.motionkit.io to authorize the connection. Sends: your site's home URL and a one-time CSRF state token. No page content or animation data is sent at this step.
* **Token exchange** — After you authorize, your site's server calls editor.motionkit.io once to exchange the authorization code for an access token. Sends: the authorization code and your site's home URL. Receives: an access token, which is encrypted (AES-256) before being stored in your site's database.
* **Session launch** — When you open the Motionkit editor for a specific page, your site's server requests a short-lived, signed session token from editor.motionkit.io. Sends: your site's home URL, the URL of the page you're editing, and your connection's access token (as a Bearer header). This happens every time you open the editor for a page.
* **Verify connection** — When you use the "Verify connection" tool in the plugin's admin page, your site's server checks whether its stored token still matches the server. Sends: your site's home URL and a one-way hash of the stored token (never the token itself).
* **Disconnect (revoke)** — When you click "Disconnect," your site's server asks editor.motionkit.io to revoke the access token. Sends: your site's home URL and the access token being revoked.

None of these calls send your site's post content, page content, or saved animation data to editor.motionkit.io — animations you build in the editor are sent back to your own WordPress site's REST API, not the other way around, and are stored in your own site's database.

**Why GSAP isn't bundled with this plugin:** GSAP is developed and licensed by Webflow, Inc. under the "GSAP Standard No Charge" license (https://gsap.com/licensing/), not the GPL or an OSI-approved open-source license. Under that license GSAP itself is free to use, including plugins that were formerly paid-only (SplitText, MorphSVGPlugin, DrawSVGPlugin, etc.), but its terms are not GPL-compatible, so this plugin cannot redistribute GSAP's source files inside its own (GPLv2-or-later) codebase. Loading it from a CDN at the version and URL you (or the Motionkit editor's defaults) configure keeps GSAP's own license terms intact and outside this plugin's redistribution — the same reasoning that governs any GPL WordPress plugin that depends on a non-GPL-compatible JavaScript library it can't ship internally.

By connecting your site to Motionkit, you agree to Motionkit's Terms of Service and Privacy Policy, linked below. By using this plugin, GSAP is loaded from jsDelivr's CDN, subject to jsDelivr's own terms and privacy policy.

* Motionkit Terms of Service: https://motionkit.io/terms-condition/
* Motionkit Privacy Policy: https://motionkit.io/privacy-policy/

== Changelog ==

= 1.0.0 =
* Initial release

== Support ==

For support, feature requests, or bug reports, please visit https://motionkit.io or the plugin's support forum on WordPress.org.
