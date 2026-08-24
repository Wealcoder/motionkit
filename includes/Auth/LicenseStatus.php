<?php

namespace MotionKit\Auth;

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

/**
 * License Status Bridge
 *
 * Delegates license status operations to MotionKitConnector\Auth\LicenseStatus.
 *
 * @package MotionKit
 * @since 1.2.0
 */
final class LicenseStatus
{
  public const CRON_HOOK = 'motionkit_license_refresh';

  public function init(): void
  {
    // Hooks handled by MotionKitConnector\Auth\LicenseStatus
  }

  public static function has_license(): bool
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      return \MotionKitConnector\Auth\LicenseStatus::has_license();
    }
    return false;
  }

  public static function limit_exceeded(): bool
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      return \MotionKitConnector\Auth\LicenseStatus::limit_exceeded();
    }
    return false;
  }

  public static function is_valid(): bool
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      return \MotionKitConnector\Auth\LicenseStatus::is_valid();
    }
    return false;
  }

  public static function is_indeterminate(): bool
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      return \MotionKitConnector\Auth\LicenseStatus::is_indeterminate();
    }
    return true;
  }

  public static function can_use(string $feature): bool
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      return \MotionKitConnector\Auth\LicenseStatus::can_use($feature);
    }
    return true;
  }

  public static function get_feature_value(string $feature)
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      return \MotionKitConnector\Auth\LicenseStatus::get_feature_value($feature);
    }
    return null;
  }

  public static function get_state(): array
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      return \MotionKitConnector\Auth\LicenseStatus::get_state();
    }
    return [
      'exists'         => false,
      'status'         => 'none',
      'plan'           => '',
      'expires_at'     => '',
      'sites_limit'    => -1,
      'sites_used'     => 0,
      'limit_exceeded' => false,
      'features'       => [],
      'checked_at'     => 0,
      'stale'          => false,
    ];
  }

  public static function refresh(bool $force = false)
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      return \MotionKitConnector\Auth\LicenseStatus::refresh($force);
    }
    return false;
  }

  public static function clear(): void
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      \MotionKitConnector\Auth\LicenseStatus::clear();
    }
  }

  public static function ensure_cron_scheduled(): void
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      \MotionKitConnector\Auth\LicenseStatus::ensure_cron_scheduled();
    }
  }

  public static function unschedule_cron(): void
  {
    if (class_exists('\MotionKitConnector\Auth\LicenseStatus')) {
      \MotionKitConnector\Auth\LicenseStatus::unschedule_cron();
    }
  }
}
