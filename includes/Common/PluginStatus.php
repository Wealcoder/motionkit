<?php

declare(strict_types=1);

namespace MotionKit\Common;

/**
 * MotionKit WordPress Plugin — Plugin Presence.
 *
 * @package MotionKit
 * @since 1.2.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class PluginStatus
{
  /**
   * Installed and running.
   */
  public const ACTIVE = 'active';

  /**
   * Not running — either not installed, or installed and not activated.
   */
  public const INACTIVE = 'inactive';

  /**
   * Key of the free wp.org plugin in a snapshot.
   */
  public const CORE = 'motionkit';

  /**
   * Key of the pro connector plugin in a snapshot.
   */
  public const CONNECTOR = 'motionkitConnector';

  /**
   * How each plugin is recognised.
   *
   * @var array<string, array<string, string>>
   */
  private const PLUGINS = [
    self::CORE => [
      'dir'      => 'motionkit',
      'basename' => 'motionkit/motionkit.php',
      'loaded'   => 'MOTIONKIT_LOADED',
      'version'  => 'MOTIONKIT_VERSION',
    ],
    self::CONNECTOR => [
      'dir'      => 'motionkit-with-gsap',
      'basename' => 'motionkit-with-gsap/motionkit-with-gsap.php',
      'loaded'   => 'MOTIONKIT_CONNECTOR_LOADED',
      'version'  => 'MOTIONKIT_CONNECTOR_VERSION',
    ],
  ];

  /**
   * Both plugins' version and status, keyed for the editor.
   *
   * @return array<string, array<string, string>>
   */
  public static function snapshot(): array
  {
    return [
      self::CORE      => self::describe(self::CORE),
      self::CONNECTOR => self::describe(self::CONNECTOR),
    ];
  }

  /**
   * One plugin's version and status.
   *
   * @param string $key One of the CORE / CONNECTOR constants.
   * @return array{version: string, status: string}
   */
  public static function describe(string $key): array
  {
    return [
      'version' => self::version($key),
      'status'  => self::status($key),
    ];
  }

  /**
   * One plugin's status.
   *
   * @param string $key One of the CORE / CONNECTOR constants.
   * @return string One of the ACTIVE / INACTIVE constants.
   */
  public static function status(string $key): string
  {
    $plugin = self::PLUGINS[$key] ?? null;
    if ($plugin === null) {
      return self::INACTIVE;
    }

    if (
      defined($plugin['loaded']) ||
      ($key === self::CONNECTOR && (defined('MOTIONKIT_CONNECTOR_LOADED') || defined('MOTIONKIT_EXTENSION_LOADED')))
    ) {
      return self::ACTIVE;
    }

    $basename = self::basename($key);
    if ($basename === '') {
      return self::INACTIVE;
    }

    self::load_plugin_api();

    return is_plugin_active($basename) ? self::ACTIVE : self::INACTIVE;
  }

  /**
   * Whether one plugin's files are on disk, activated or not.
   *
   * @param string $key One of the CORE / CONNECTOR constants.
   * @return bool
   */
  public static function is_installed(string $key): bool
  {
    $plugin = self::PLUGINS[$key] ?? null;
    if ($plugin === null) {
      return false;
    }

    return (
      defined($plugin['loaded']) ||
      ($key === self::CONNECTOR && (defined('MOTIONKIT_CONNECTOR_LOADED') || defined('MOTIONKIT_EXTENSION_LOADED'))) ||
      self::basename($key) !== ''
    );
  }

  /**
   * One plugin's version, empty when it is not installed.
   *
   * @param string $key One of the CORE / CONNECTOR constants.
   * @return string
   */
  public static function version(string $key): string
  {
    $plugin = self::PLUGINS[$key] ?? null;
    if ($plugin === null) {
      return '';
    }

    if (defined($plugin['version'])) {
      return (string) constant($plugin['version']);
    }

    if ($key === self::CONNECTOR && defined('MOTIONKIT_EXTENSION_VERSION')) {
      return (string) constant('MOTIONKIT_EXTENSION_VERSION');
    }

    $basename = self::basename($key);
    if ($basename === '') {
      return '';
    }

    self::load_plugin_api();

    return (string) (get_plugins()[$basename]['Version'] ?? '');
  }

  /**
   * One plugin's basename among installed plugins, empty when it is not installed.
   *
   * @param string $key One of the CORE / CONNECTOR constants.
   * @return string Basename like "motionkit-with-gsap/motionkit-with-gsap.php".
   */
  public static function basename(string $key): string
  {
    $plugin = self::PLUGINS[$key] ?? null;
    if ($plugin === null) {
      return '';
    }

    self::load_plugin_api();

    $all = get_plugins();

    if (isset($all[$plugin['basename']])) {
      return $plugin['basename'];
    }

    $dirs = $key === self::CONNECTOR
      ? ['motionkit-with-gsap', 'motionkit-connector', 'motionkit-extension']
      : [$plugin['dir']];

    foreach (array_keys($all) as $bname) {
      foreach ($dirs as $dir) {
        if (strpos($bname, $dir . '/') === 0) {
          return $bname;
        }
      }
    }

    return '';
  }

  /**
   * Whether the pro connector is active on this site.
   *
   * @return bool
   */
  public static function connector_is_active(): bool
  {
    return self::status(self::CONNECTOR) === self::ACTIVE;
  }

  /**
   * The pro connector's basename, falling back to the one it ships under.
   *
   * @return string
   */
  public static function connector_basename(): string
  {
    $basename = self::basename(self::CONNECTOR);

    return $basename !== '' ? $basename : self::PLUGINS[self::CONNECTOR]['basename'];
  }

  /**
   * Pull in WordPress's plugin API when it is not already in scope.
   *
   * @return void
   */
  private static function load_plugin_api(): void
  {
    if (!function_exists('get_plugins') || !function_exists('is_plugin_active')) {
      require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
  }
}
