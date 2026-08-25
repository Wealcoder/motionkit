=== MotionKit – Visual Animation Connector ===
Contributors: wealcoder
Tags: animation, scroll animation, visual editor
Requires at least: 6.7
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Donate link: https://buy.stripe.com/3cs3dI7DQauI0py9AC

Connect WordPress with MotionKit to create, preview, publish, and manage visual website animations from the MotionKit editor.

== Description ==

Motionkit connects your WordPress site to the [Motionkit](https://editor.motionkit.io) visual animation editor, so you can build scroll effects, hover interactions, and text/image animations without writing JavaScript.

This plugin is the WordPress-side connector: it authenticates your site with the Motionkit editor, stores the animations and settings you create, and renders them on the front end. The visual editor itself runs at editor.motionkit.io — you design animations there against a live preview of your actual pages, then Motionkit saves the result back to your site.

= Key Features =

* **Visual animation editor** – Build scroll-triggered, hover, and load-in animations on a live preview of your site, no code required
* **High-performance animation engine** – Smooth, performant motion powered by the Motionkit runtime
* **Per-page and global animations** – Apply animations to a single post/page, a whole post type, or site-wide
* **Preloaders and page transitions** – Greet visitors with an animated preloader and glide between pages with smooth transitions
* **Ready-made presets** – Text reveals, image hover effects, scroll parallax, and interactive hover effects out of the box
* **Cloud preset library** – Browse a growing cloud library of professionally designed animations, searchable right inside the editor
* **One-click animation import** – Import any cloud animation onto your page with a single click, then fine-tune it visually
* **Easy for non-technical users** – No JavaScript, no CSS, no keyframes — everything is point-and-click on a live preview
* **AI assistant support (MCP)** – Works with ChatGPT, Claude, and Gemini through the MotionKit MCP server (https://editor.motionkit.io/mcp), so you can create and edit animations by simply chatting with your AI assistant
* **Device-aware** – Configure different behavior per breakpoint (desktop, laptop, tablet, mobile)
* **Secure by design** – Signed, single-use session tokens for the editor connection; sanitized input and escaped output throughout
* **Built for performance** – Assets are only enqueued on pages that actually have animations configured

= How it works =

1. Install and activate the plugin.
2. Connect your site to Motionkit from the plugin's admin page (OAuth-style authorization — no manual API keys to copy/paste).
3. Open the Motionkit editor and pick the page you want to animate. The editor loads a live, interactive preview of that exact page.
4. Build your animation visually and save. The plugin stores it on your site and renders it on the front end.

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

Motionkit is a visual animation editor for WordPress. Install this plugin, connect your site, and design scroll effects, hover interactions, and text/image animations at editor.motionkit.io — no code needed. Everything you build is saved back to your own site.

= Do I need a Motionkit account? =

Yes. You connect your site to your Motionkit account once, then build animations in the editor against a live preview of your site.

= Is Motionkit free? =

Yes — start on the free plan and build animations right away, no credit card needed. Premium presets and pro features are available on paid plans, and you can upgrade anytime from your Motionkit account.

= Do I need to know how to code? =

No. Everything is visual — click an element on the live preview of your page, pick an effect, fine-tune it, and save. If you can use a page builder, you can use Motionkit. Prefer talking instead of clicking? Describe the animation to your AI assistant and let it build it for you (see the MCP question below).

= Does it work with my theme or page builder? =

Yes. Motionkit animates the pages your site actually renders, so it works alongside any theme or page builder — Gutenberg, Elementor, and others — without changing how you build your content.

= Will animations slow down my site? =

No. Scripts are loaded only on pages that actually have animations, and the runtime is built for smooth, hardware-accelerated motion — your other pages are left completely untouched.

= Is the plugin secure? =

Yes. The editor connection uses short-lived, signed session tokens instead of passwords or long-lived keys. Admin actions are protected with WordPress nonces and permission checks, all input is sanitized, all output is escaped, and the stored connection token is encrypted (AES-256).

= Why don't all requests use a WordPress nonce? =

Every admin action that changes something on your site is protected by a standard WordPress nonce. Two requests can't use one, because they come from Motionkit's servers — not from a link this site generated — and another server has no way to create a valid WordPress nonce for your site:

* **The redirect back after you click "Connect"** is protected the standard OAuth way instead: a random, single-use `state` value your site creates first and checks when you return — the same flow "Sign in with Google" uses.
* **The editor's live-preview iframe** identifies itself with a short-lived signed token (JWT) that is validated on every request.

Both checks run before anything is read or written — nothing is left unprotected; these requests simply use the right tool for where they come from.

= Can I build animations with an AI assistant (ChatGPT, Claude, Gemini)? =

Yes. Add Motionkit's MCP server (https://editor.motionkit.io/mcp) to any MCP-capable AI assistant and sign in with your Motionkit account. Your assistant can then create, edit, and preview animations in your open editor tab. Opening that link in a browser shows "unauthorized" — that's expected; it's an endpoint for AI assistants, not a web page.

= What happens to my animations if I disconnect? =

Nothing is deleted. Your saved animations stay on your site and keep running — disconnecting only stops new edits from the editor.

== External services ==

This plugin is the WordPress dashboard for **Motionkit** (editor.motionkit.io), a hosted service that provides the visual animation editor. Using it requires a Motionkit account and the free Motionkit Connector companion plugin.

This plugin makes no remote requests of its own — it renders links that open Motionkit in your browser:

* **"Launch Motionkit" and "Build Animation" links** (admin page, admin bar, post/term rows) open editor.motionkit.io. These links include your site's home URL, the URL of the page being edited, and a short-lived signed session token, so the editor can load a live preview of that page.
* **The "Connect" button** sends your browser to editor.motionkit.io to authorize the connection; the link includes your site's home URL and a one-time security token. The authorization itself, and every server-side call that follows, is handled by the Connector plugin.
* **The Connector download link** points to billing.motionkit.io (a Motionkit-operated domain). Clicking it is a normal file download; no site data is sent.

Your posts, pages, and saved animation data are never sent to Motionkit — animations you build in the editor are saved back to your own site's database.

By connecting your site to Motionkit, you agree to Motionkit's Terms of Service and Privacy Policy, linked below.

* Motionkit Terms of Service: https://motionkit.io/terms-condition/
* Motionkit Privacy Policy: https://motionkit.io/privacy-policy/

== Source Code ==

The source code and development repository for this plugin is available on GitHub:
https://github.com/Wealcoder/motionkit

== Screenshots ==

1. The Motionkit visual editor — build animations on a live preview of your site
2. Connecting your WordPress site to Motionkit from the plugin's admin page
3. The cloud preset library — search and import ready-made animations in one click
4. The Tools tab — review and manage the animation data saved on your site

== Changelog ==

= 1.0.0 =
* Initial release

== Support ==

For support, feature requests, or bug reports, please visit https://motionkit.io or the plugin's support forum on WordPress.org.

== Upgrade Notice ==

= 1.0.0 =
* Initial release. No upgrade needed.
