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

	public static function check_file_in_uploads($file_name)
	{
		global $wp_filesystem;
		require_once(ABSPATH . '/wp-admin/includes/file.php');
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
	 * Count total and active elements in the animation builder data.
	 *
	 * @param array $data The decoded form data.
	 * @return array ['total' => int, 'active' => int]
	 */
	public static function count_total_and_active_elements($data)
	{
		$active_count = 0;
		$total_count  = 0;
		if (is_array($data) && isset($data['elements'])) {
			foreach ($data['elements'] as $group) {
				if (isset($group['elements']) && is_array($group['elements'])) {
					foreach ($group['elements'] as $element) {
						++$total_count;
						if (! empty($element['is_active'])) {
							++$active_count;
						}
					}
				}
			}
		}
		return array(
			'total'  => $total_count,
			'active' => $active_count,
		);
	}

	/**
	 * @return string | bool
	 * @since 1.0
	 * @param string	
	 */
	public static function is_valid_css_container_max_width($value)
	{

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
			case JSON_ERROR_DEPTH:
				return 'Maximum stack depth exceeded';
			case JSON_ERROR_STATE_MISMATCH:
				return 'Underflow or the modes mismatch';
			case JSON_ERROR_CTRL_CHAR:
				return 'Unexpected control character found';
			case JSON_ERROR_SYNTAX:
				return 'Syntax error, malformed JSON';
			case JSON_ERROR_UTF8:
				return 'Malformed UTF-8 characters, possibly incorrectly encoded';
			default:
				return 'Unknown error';
		}
	}
}
