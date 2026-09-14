<?php

declare(strict_types=1);

namespace MotionKit\Common;

/**
 * MotionKit WordPress Plugin — Editor Endpoint Resolver.
 *
 * Resolves the SaaS editor base URL and endpoints.
 * Supports MOTIONKIT_EDITOR_ORIGIN constant for local development.
 *
 * @package MotionKit
 * @since 1.2.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class EditorEndpoint
{
  public const DEFAULT_ORIGIN = 'https://editor.motionkit.io';

  private static ?string $origin = null;

  public static function origin(): string
  {
    if (self::$origin !== null) {
      return self::$origin;
    }

    $env_origin = null;
    if (defined('MOTIONKIT_EDITOR_ORIGIN') && is_string(MOTIONKIT_EDITOR_ORIGIN)) {
      $env_origin = MOTIONKIT_EDITOR_ORIGIN;
    } elseif (defined('MOTIONKIT_CONNECTOR_EDITOR_ORIGIN') && is_string(MOTIONKIT_CONNECTOR_EDITOR_ORIGIN)) {
      $env_origin = MOTIONKIT_CONNECTOR_EDITOR_ORIGIN;
    }

    if ($env_origin === null) {
      return self::$origin = self::DEFAULT_ORIGIN;
    }

    $origin = rtrim(trim($env_origin), '/');
    if (!preg_match('#^https?://[A-Za-z0-9.\-]+(:\d{1,5})?$#', $origin)) {
      return self::$origin = self::DEFAULT_ORIGIN;
    }

    return self::$origin = $origin;
  }

  public static function base(): string
  {
    return self::origin() . '/';
  }

  public static function url(string $path = ''): string
  {
    if ($path === '') {
      return self::base();
    }
    return self::origin() . '/' . ltrim($path, '/');
  }

  public static function is_default(): bool
  {
    return self::origin() === self::DEFAULT_ORIGIN;
  }
}
