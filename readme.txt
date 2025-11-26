=== GSAP Animation Builder for WordPress ===
Contributors: wealcoder
Tags: animation, gsap, scroll animation, motion effects, 
Requires at least: 6.7
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A powerful and customizable GSAP animation builder plugin for WordPress that allows you to create stunning animations with ease. Built with modern architecture, performance optimizations, and design patterns.

== Description ==

**GSAP Animation Builder for WordPress** is a powerful animation plugin that enables you to create stunning GSAP-powered animations for your WordPress website. Built with modern PHP practices, performance optimizations, and design patterns, this plugin provides a solid foundation for creating smooth, performant animations.

= Key Features =

* **Modern Architecture** - Built with design patterns (Factory, Strategy, Decorator, Singleton)
* **Performance Optimized** - Lazy loading, caching, and conditional asset loading
* **Easy Animation Creation** - Build animations with a visual interface
* **Secure** - Comprehensive security measures and data sanitization
* **Extensible** - Easy to extend with custom strategies and decorators
* **Well Documented** - Comprehensive developer documentation

= Performance Features =

* **Caching System** - Object caching for options and expensive operations
* **Lazy Loading** - Components loaded only when needed
* **Conditional Loading** - Assets loaded based on context
* **Duplicate Prevention** - Prevents duplicate asset enqueueing
* **Request Optimization** - Skips initialization on AJAX/cron requests

= Design Patterns Implemented =

* **Singleton Pattern** - Ensures single plugin instance
* **Factory Pattern** - Centralized component creation
* **Strategy Pattern** - Encapsulates animation algorithms
* **Decorator Pattern** - Extends asset loader functionality

= Developer Friendly =

* PSR-4 Autoloading
* Comprehensive API documentation
* Easy to extend and customize
* Modern PHP 7.4+ features
* WordPress coding standards compliant

== Installation ==

= Minimum Requirements =

* WordPress 6.7 or greater
* PHP version 7.4 or greater
* MySQL version 5.0 or greater

= Recommended Requirements =

* PHP version 8.0 or greater
* MySQL version 5.7 or greater
* WordPress Memory limit of 128 MB or greater

= Installation Steps =

1. Upload the plugin folder to `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure settings as needed

= Usage =

Once activated, you can start creating animations using the plugin's animation builder interface.

**Basic Usage:**
* Access animation builder through post edit pages
* Create and customize animations
* Preview animations in real-time
* Save and apply animations to your content

== Frequently Asked Questions ==

= What is GSAP Animation Builder for WordPress? =

GSAP Animation Builder for WordPress is a powerful plugin that enables you to create GSAP-powered animations for your WordPress website without requiring extensive coding knowledge.

= Does this plugin require GSAP library? =

Yes, the plugin is designed to work with GSAP (GreenSock Animation Platform). You'll need to load the GSAP library separately or include it with your theme.

= What are the system requirements? =

* WordPress 6.7+
* PHP 7.4+
* GSAP Library (loaded separately or included)

= Is this plugin performance optimized? =

Yes! The plugin includes multiple performance optimizations:
* Object caching for options
* Lazy loading of components
* Conditional asset loading
* Duplicate asset prevention
* Request optimization

= Can I extend this plugin? =

Absolutely! The plugin is built with extensibility in mind. You can:
* Create custom animation strategies
* Add custom decorators
* Hook into plugin lifecycle events
* Extend existing functionality

See the DEVELOPER.md file for detailed documentation.

= Is the plugin secure? =

Yes, the plugin follows WordPress security best practices:
* Nonce verification for AJAX requests
* Data sanitization and validation
* Capability checks
* Secure coding practices

== Screenshots ==

1. **Animation Builder Interface** - Create animations with an intuitive visual interface
2. **Performance Dashboard** - Monitor and optimize plugin performance
3. **Asset Management** - Manage and load assets conditionally
4. **Developer Tools** - Extend functionality with custom code

== Hooks & Filters ==

= Actions =

* `WCF_ANIMATION_BUILDER_LOADED` - Fired after plugin initialization
* `wcf_animation_builder_activated` - Fired on plugin activation
* `wcf_animation_builder_deactivated` - Fired on plugin deactivation

= Usage Example =

[code]
add_action('WCF_ANIMATION_BUILDER_LOADED', function() {
    // Your custom code here
});
[/code]

== Changelog ==

= 1.0.0 - 2024-01-01 =
* Initial release
* Core animation builder functionality
* Performance optimizations
* Caching system
* Lazy loading implementation
* Conditional asset loading
* Design patterns implementation (Factory, Strategy, Decorator, Singleton)
* Comprehensive documentation
* Security enhancements
* Developer-friendly API

== Upgrade Notice ==

= 1.0.0 =
Initial release of GSAP Animation Builder for WordPress. Upgrade from previous versions is not applicable.

== Support ==

For support, feature requests, or bug reports, please visit the plugin repository or contact the development team.

== Credits ==

Built with modern PHP practices and WordPress coding standards. Uses design patterns for maintainability and extensibility.
