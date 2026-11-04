<?php

declare(strict_types=1);

namespace MotionKit\Admin;

use MotionKit\Auth\OAuthHandler;
use MotionKit\Common\PluginStatus;

/**
 * One-week notice on the MotionKit page that a newer MotionKit with GSAP is available.
 *
 * Before 2.0.2 the add-on offered updates only to a site with a license key, so
 * a site without one never learns about a new version on its own. This plugin
 * only says so and links to the file; the site owner installs it through
 * WordPress's own upload screen. Remove this class, and its call in ConnectPage,
 * once the offer has ended.
 *
 * @package MotionKit
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class ConnectorUpdateNotice
{
  private const LATEST_TRANSIENT = 'motionkit_connector_latest_version';
  private const UNKNOWN = 'unknown';
  private const OFFER_ENDS = '2026-11-12 00:00:00 UTC';
  private const LATEST_RELEASE_URL = 'https://github.com/Wealcoder/motionkit-with-gsap/releases/latest';
  private const PACKAGE_URL = 'https://github.com/Wealcoder/motionkit-with-gsap/releases/latest/download/motionkit-with-gsap.zip';
  private const STORE_URL = 'https://my.motionkit.io/';
  private const STORE_ITEM_ID = 17;

  public static function render(): void
  {
    $latest = self::available_update();
    if ($latest === '') {
      return;
    }

    $current = PluginStatus::version(PluginStatus::CONNECTOR);
    ?>
    <div class="motionkit-notice motionkit-notice--info">
      <p>
        <?php
        /* translators: 1: latest version of the add-on, 2: version this site runs. */
        echo esc_html(sprintf(__('MotionKit with GSAP %1$s is available. This site runs %2$s. Download the file, then upload it on the Upload Plugin screen and choose Replace current with uploaded.', 'motionkit'), $latest, $current));
        ?>
      </p>
      <p>
        <a class="motionkit-btn motionkit-btn--primary" href="<?php echo esc_url(self::PACKAGE_URL); ?>"><?php esc_html_e('Download the update', 'motionkit'); ?></a>
        <a class="motionkit-btn" href="<?php echo esc_url(admin_url('plugin-install.php?tab=upload')); ?>"><?php esc_html_e('Open Upload Plugin', 'motionkit'); ?></a>
      </p>
    </div>
    <?php
  }

  // The newer version to announce, or empty. The cheap local checks run first, so a site this does not apply to never makes a request, and only a site whose owner agreed to connect does.
  private static function available_update(): string
  {
    if (
      time() >= (int) strtotime(self::OFFER_ENDS)
      || !current_user_can('update_plugins')
      || !OAuthHandler::is_connected()
      || !PluginStatus::is_installed(PluginStatus::CONNECTOR)
    ) {
      return '';
    }

    $current = PluginStatus::version(PluginStatus::CONNECTOR);
    $latest = self::latest_version();

    return ($current !== '' && $latest !== '' && version_compare($current, $latest, '<')) ? $latest : '';
  }

  // A failed lookup is remembered too, for less time, so an outage does not slow every visit to this page.
  private static function latest_version(): string
  {
    $cached = get_transient(self::LATEST_TRANSIENT);
    if (is_string($cached) && $cached !== '') {
      return $cached === self::UNKNOWN ? '' : $cached;
    }

    $latest = self::latest_release_version();
    if ($latest === '') {
      $latest = self::store_version();
    }

    set_transient(
      self::LATEST_TRANSIENT,
      $latest !== '' ? $latest : self::UNKNOWN,
      $latest !== '' ? 3 * HOUR_IN_SECONDS : 15 * MINUTE_IN_SECONDS
    );

    return $latest;
  }

  // GitHub redirects this link to the latest release's tag page, which names the version without an API call or its hourly limit.
  private static function latest_release_version(): string
  {
    $response = wp_remote_head(self::LATEST_RELEASE_URL, ['timeout' => 5, 'redirection' => 0]);
    if (is_wp_error($response)) {
      return '';
    }

    $location = (string) wp_remote_retrieve_header($response, 'location');

    return preg_match('#/releases/tag/v(\d+\.\d+\.\d+)$#', $location, $matches) ? $matches[1] : '';
  }

  // The store answers with the version without a license, and this sends it nothing about the site.
  private static function store_version(): string
  {
    $response = wp_remote_post(self::STORE_URL, [
      'timeout' => 5,
      'body'    => ['edd_action' => 'get_version', 'item_id' => self::STORE_ITEM_ID],
    ]);
    if (is_wp_error($response) || (int) wp_remote_retrieve_response_code($response) !== 200) {
      return '';
    }

    $body = json_decode((string) wp_remote_retrieve_body($response), true);
    $version = is_array($body) ? (string) ($body['new_version'] ?? '') : '';

    return preg_match('/^\d+\.\d+\.\d+$/', $version) ? $version : '';
  }
}
