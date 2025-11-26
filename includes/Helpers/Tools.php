<?php

namespace WcfAnimationBuilder\Helpers;

if (!defined('ABSPATH')) {
	exit;
}

class Tools
{
	public static function sanitizeDeep($var)
	{
		if (is_array($var)) {
			return array_map([self::class, 'sanitizeDeep'], $var);
		}
		return is_scalar($var) ? sanitize_text_field($var) : $var;
	}

	public static function getEditedPostId(): int
	{
		if (!empty($_GET['post']) && !empty($_GET['action']) && $_GET['action'] === 'edit' && !empty($GLOBALS['pagenow']) && $GLOBALS['pagenow'] === 'post.php') { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return (int) $_GET['post']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}
		return 0;
	}

	public static function check_file_in_uploads($file_name) {
		global $wp_filesystem;
		require_once ( ABSPATH . '/wp-admin/includes/file.php' );
		WP_Filesystem(); 	
		// Get the upload directory
		$upload_dir = wp_upload_dir();
		$upload_path = $upload_dir['basedir'] . '/wcf-animations/'; // The folder inside the uploads directory
		$upload_url = $upload_dir['baseurl'] . '/wcf-animations/'; 
	
		// Full path to the file
		$file_path = $upload_path . $file_name;
		$url_path = $upload_url . $file_name;
	
		// Check if the file exists
		if ($wp_filesystem->exists($file_path)) {
			return $url_path;  // File exists
		} else {
			return false; // File does not exist
		}
	}

	/**
	 * @return string | bool
	 * @since 1.0
	 * @param string	
	 */
	public static function is_valid_css_container_max_width($value) {
	
		$value = trim($value);
	
		// Check if the string is a number only (integer or decimal)
		if (is_numeric($value)) {
			// If it's a valid number, return it with 'px' appended
			return $value . 'px';
		}
	
		// Regular expression to validate CSS max-width values
		$pattern = '/^(0|(\d+(\.\d+)?\s*(px|em|rem|%)))$/';
	
		// Check if the string matches the pattern
		if (preg_match($pattern, $value)) {
			return $value; // Valid, return as-is
		} else {
			return false; // Invalid format
		}
	}

	public static function builder_setting_option($key, $default = '')
	{
		return \WcfAnimationBuilder\Helpers\Helper::get_option($key, $default);
	}

	/**
     * Retrieves all registered image sizes.
     *
     * @return array List of image sizes by name.
     */
	public static function get_all_image_sizes() {
		global $_wp_additional_image_sizes;
	
		$default_image_sizes = get_intermediate_image_sizes();
	
		foreach ( $default_image_sizes as $size ) {
			$image_sizes[ $size ][ 'width' ] = intval( get_option( "{$size}_size_w" ) );
			$image_sizes[ $size ][ 'height' ] = intval( get_option( "{$size}_size_h" ) );
			$image_sizes[ $size ][ 'crop' ] = get_option( "{$size}_crop" ) ? get_option( "{$size}_crop" ) : false;
		}
	
		return array_keys( $image_sizes );
	}

	public static function isValidDomainName(string $domain): bool
	{
		return (preg_match("/^([a-z\d](-*[a-z\d])*)(\.([a-z\d](-*[a-z\d])*))*$/i", $domain)
			&& preg_match("/^.{1,253}$/", $domain)
			&& preg_match("/^[^\.]{1,63}(\.[^\.]{1,63})*$/", $domain));
	}

	public static function getVariablesFromFile(string $filePath, array $extractVariables, array $setVariables = []): array
	{
		extract($setVariables, EXTR_REFS);
		unset($setVariables);
		require $filePath;
		foreach ($extractVariables as $variableName => $defaultValue) {
			if (isset($$variableName)) {
				$extractVariables[$variableName] = $$variableName; // @phpstan-ignore-line dynamic
			}
		}
		return $extractVariables;
	}

	public static function renderView(string $filePath, array $viewVariables = [], bool $return = true): string
	{
		if (!is_file($filePath)) {
			return '';
		}
		extract($viewVariables, EXTR_REFS);
		unset($viewVariables);
		if ($return) {
			ob_start();
			require $filePath;
			return ob_get_clean();
		}
		require $filePath;
		return '';
	}

	public static function htmlTag(string $tag, array $attr = [], $end = false): string
	{
		$html = '<' . $tag . ' ' . self::attrToHtml($attr);
		if ($end === true) {
			$html .= '></' . $tag . '>';
		} elseif ($end === false) {
			$html .= '/>';
		} else {
			$html .= '>' . $end . '</' . $tag . '>';
		}
		return $html;
	}

	public static function fixPath(string $path): string
	{
		$windowsNetwork = isset($_SERVER['windir']) && in_array(substr($path, 0, 2), ['//', '\\'], true);
		$fixed = untrailingslashit(str_replace(['//', '\\', '\\'], ['/', '/', '/'], $path));
		if (empty($fixed) && !empty($path)) {
			$fixed = '/';
		}
		if ($windowsNetwork) {
			$fixed = '//' . ltrim($fixed, '/');
		}
		return $fixed;
	}

	public static function htmlspecialcharsUtf8(string $string): string
	{
		return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
	}

	public static function attrToHtml(array $attrs): string
	{
		$html = '';
		foreach ($attrs as $name => $val) {
			if ($val === false) {
				continue;
			}
			$html .= $name . '="' . self::htmlspecialcharsUtf8((string) $val) . '" ';
		}
		return $html;
	}

	public static function getDirFileList(string $dir, string $ext = 'php'): array
	{
		if (!is_dir($dir)) {
			return [];
		}
		$files = [];
		foreach (glob("$dir/*.{$ext}") as $filename) {
			$files[basename(dirname($filename)) . '-' . basename($filename, '.' . $ext)] = $filename;
		}
		return $files;
	}

	public static function settingOption(string $key, $default = '')
	{
		return \WcfAnimationBuilder\Helpers\Helper::get_option($key, $default);
	}

	public static function textSettingOption(string $key, $default = '')
	{
		$value = \WcfAnimationBuilder\Helpers\Helper::get_option($key, $default);
		return $value !== '' ? $value : $default;
	}

	public static function clean($var)
	{
		if (is_array($var)) {
			return array_map([self::class, 'clean'], $var);
		}
		return is_scalar($var) ? sanitize_text_field($var) : $var;
	}

	public static function hex2dec(string $color = '#000000'): array
	{
		return [
			'R' => hexdec(substr($color, 1, 2)),
			'G' => hexdec(substr($color, 3, 2)),
			'B' => hexdec(substr($color, 5, 2)),
		];
	}

	public static function px2mm($px)
	{
		return $px * 25.4 / 72;
	}

	public static function txtentities(string $html): string
	{
		$trans = get_html_translation_table(HTML_ENTITIES);
		$trans = array_flip($trans);
		return strtr($html, $trans);
	}

	public static function checkFileInUploads(string $fileName)
	{
		global $wp_filesystem;
		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();
		$uploadDir = wp_upload_dir();
		$path = $uploadDir['basedir'] . '/wcf-animations/';
		$urlBase = $uploadDir['baseurl'] . '/wcf-animations/';
		$filePath = $path . $fileName;
		$urlPath = $urlBase . $fileName;
		return $wp_filesystem->exists($filePath) ? $urlPath : false;
	}

	public static function allowedHtml(): array
	{
		return [
			'a' => ['href' => true, 'title' => true, 'target' => true, 'rel' => true, 'class' => true, 'data-*' => true],
			'table' => ['id' => true, 'class' => true, 'style' => true, 'border' => true],
			'thead' => ['class' => true, 'style' => true],
			'tbody' => ['class' => true, 'style' => true],
			'tr' => ['class' => true, 'style' => true],
			'th' => ['scope' => true, 'class' => true, 'style' => true, 'colspan' => true, 'rowspan' => true],
			'td' => ['class' => true, 'style' => true, 'colspan' => true, 'rowspan' => true],
			'br' => [], 'em' => [], 'strong' => [],
			'p' => ['class' => true, 'style' => true, 'id' => true],
			'span' => ['class' => true, 'style' => true],
			'div' => ['class' => true, 'style' => true, 'id' => true],
			'ul' => ['class' => true], 'ol' => ['class' => true], 'li' => ['class' => true],
			'img' => ['src' => true, 'alt' => true, 'title' => true, 'class' => true, 'id' => true, 'width' => true, 'height' => true],
			'form' => ['action' => true, 'method' => true, 'enctype' => true, 'id' => true, 'class' => true],
			'input' => ['type' => true, 'name' => true, 'value' => true, 'id' => true, 'class' => true, 'placeholder' => true, 'checked' => true, 'disabled' => true, 'data-*' => true, 'style' => true],
			'textarea' => ['name' => true, 'rows' => true, 'cols' => true, 'id' => true, 'class' => true, 'placeholder' => true],
			'select' => ['name' => true, 'id' => true, 'class' => true],
			'option' => ['value' => true, 'selected' => true],
			'h1' => ['class' => true, 'style' => true], 'h2' => ['class' => true, 'style' => true], 'h3' => ['class' => true, 'style' => true], 'h4' => ['class' => true, 'style' => true], 'h5' => ['class' => true, 'style' => true], 'h6' => ['class' => true, 'style' => true],
			'button' => ['type' => true, 'name' => true, 'value' => true, 'id' => true, 'class' => true],
			'label' => ['for' => true, 'style' => ['display' => true, 'margin-right' => true], 'id' => true, 'class' => true],
		];
	}

	public static function isValidCssContainerMaxWidth($value)
	{
		$value = trim((string) $value);
		if (is_numeric($value)) {
			return $value . 'px';
		}
		$pattern = '/^(0|(\d+(\.\d+)?\s*(px|em|rem|%)))$/';
		return preg_match($pattern, $value) ? $value : false;
	}

	public static function validateJson(string $json)
	{
		json_decode($json, true);
		if (json_last_error() === JSON_ERROR_NONE) {
			return true;
		}
		switch (json_last_error()) {
			case JSON_ERROR_DEPTH: return 'Maximum stack depth exceeded';
			case JSON_ERROR_STATE_MISMATCH: return 'Underflow or the modes mismatch';
			case JSON_ERROR_CTRL_CHAR: return 'Unexpected control character found';
			case JSON_ERROR_SYNTAX: return 'Syntax error, malformed JSON';
			case JSON_ERROR_UTF8: return 'Malformed UTF-8 characters, possibly incorrectly encoded';
			default: return 'Unknown error';
		}
	}
}

