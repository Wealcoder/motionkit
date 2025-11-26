# Languages Directory

This directory contains translation files for the plugin.

## File Types

### .pot (Portable Object Template)
- Template file containing all translatable strings
- Used by translators as a reference
- Example: `gsap-animation-builder-for-wordpress.pot`

### .po (Portable Object)
- Source file for translations
- Contains original strings and translations
- Example: `gsap-animation-builder-for-wordpress-en_US.po`

### .mo (Machine Object)
- Compiled binary version of .po file
- Used by WordPress to load translations
- Generated from .po file
- Example: `gsap-animation-builder-for-wordpress-en_US.mo`

## File Naming Convention

Translation files should follow this naming pattern:

```
gsap-animation-builder-for-wordpress-{locale}.{extension}
```

Where `{locale}` is the language code (e.g., `en_US`, `es_ES`, `fr_FR`)

### Examples:
- `gsap-animation-builder-for-wordpress-en_US.po`
- `gsap-animation-builder-for-wordpress-es_ES.po`
- `gsap-animation-builder-for-wordpress-fr_FR.po`
- `gsap-animation-builder-for-wordpress-de_DE.po`

## Loading Translations

The plugin automatically loads translations via `load_textdomain()` in `Plugin.php`:

```php
load_textdomain(
    'gsap-animation-builder-for-wordpress',
    plugin_dir_path(__FILE__) . '../languages/gsap-animation-builder-for-wordpress-' . get_locale() . '.mo'
);
```

## Creating Translation Files

### Using Poedit (Recommended)

1. Download and install [Poedit](https://poedit.net/)
2. Open Poedit and select "New Translation"
3. Select the `.pot` file from this directory
4. Choose your target language
5. Translate the strings
6. Save the file as `gsap-animation-builder-for-wordpress-{locale}.po`
7. Poedit will automatically generate the `.mo` file

### Using WP-CLI

```bash
# Extract translatable strings
wp i18n make-pot . languages/gsap-animation-builder-for-wordpress.pot

# Create .po file from .pot
wp i18n make-pot . languages/gsap-animation-builder-for-wordpress-es_ES.po

# Generate .mo file from .po
msgfmt languages/gsap-animation-builder-for-wordpress-es_ES.po -o languages/gsap-animation-builder-for-wordpress-es_ES.mo
```

### Using grunt-wp-i18n (For Build Process)

```javascript
// gruntfile.js
wp_i18n: {
    default: {
        options: {
            domainPath: '/languages',
            potFilename: 'gsap-animation-builder-for-wordpress.pot',
            type: 'wp-plugin'
        },
        files: {
            src: ['**/*.php']
        }
    }
}
```

## Using Translatable Strings in Code

### Basic Translation Function

```php
__('Text to translate', 'gsap-animation-builder-for-wordpress')
```

### Echo Translation

```php
_e('Text to translate', 'gsap-animation-builder-for-wordpress')
```

### Get Translation with Context

```php
_x('Text', 'Context', 'gsap-animation-builder-for-wordpress')
```

### Plural Translation

```php
_n('Single item', 'Multiple items', $count, 'gsap-animation-builder-for-wordpress')
```

### Translation with Placeholders

```php
sprintf(
    __('Welcome, %s!', 'gsap-animation-builder-for-wordpress'),
    $username
)
```

## Text Domain

The plugin's text domain is: **`gsap-animation-builder-for-wordpress`**

Always use this text domain when calling translation functions:

```php
__('Hello World', 'gsap-animation-builder-for-wordpress')
```

## Default Language

The plugin's default language is English (`en_US`). If no translation file exists for a locale, WordPress will fall back to the default language strings.

## Contributing Translations

1. Create a `.po` file for your locale
2. Translate all strings
3. Generate the corresponding `.mo` file
4. Submit both files as a pull request or send to the plugin author

## Best Practices

1. **Always use translation functions** - Never hardcode translatable strings
2. **Use descriptive text** - Make strings clear for translators
3. **Avoid concatenation** - Use placeholders instead
4. **Context matters** - Use `_x()` when context is needed
5. **Plural forms** - Use `_n()` for plural strings
6. **Keep text domain consistent** - Always use the plugin's text domain

## Example Structure

```
languages/
├── index.php                                         (security file)
├── gsap-animation-builder-for-wordpress.pot         (template file)
├── gsap-animation-builder-for-wordpress-en_US.po    (English source)
├── gsap-animation-builder-for-wordpress-en_US.mo    (English compiled)
├── gsap-animation-builder-for-wordpress-es_ES.po    (Spanish source)
├── gsap-animation-builder-for-wordpress-es_ES.mo    (Spanish compiled)
└── README.md                                        (this file)
```

## Resources

- [WordPress i18n Documentation](https://developer.wordpress.org/advanced-administration/wordpress/i18n/)
- [Poedit](https://poedit.net/)
- [WP-CLI i18n Commands](https://developer.wordpress.org/cli/commands/i18n/)

