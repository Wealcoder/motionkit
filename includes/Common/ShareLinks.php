<?php

namespace MotionKit\Common;

/**
 * Share links for previewing unpublished animations on the live site.
 *
 * Rows live in the page's own post_meta (`motionkit_pg_share_<type>`) rather
 * than a custom table: post_meta already travels with exports, backups and
 * staging pushes, and dies with the page.
 *
 * The token is DERIVED, not minted: an HMAC of what identifies the page under a
 * site-wide key. That is what makes the link stable — asking for it twice cannot
 * produce two URLs, so a link handed out months ago still resolves — and it
 * means the row holds no secret at all, only the records to render.
 *
 * A row carries the shared animation records themselves, not a pointer into the
 * draft bucket. That is what keeps unpublished storage out of reach of a
 * front-end request: the render path for a share link reads only this key, so
 * `motionkit_pg_draft_<type>` is never touched by a visitor, token or not. The
 * copy is refreshed on every save by `reconcile()`.
 *
 * A link belongs to the PAGE, not to a chosen animation, and it does not expire
 * or retire itself. Publishing everything no longer takes it away — it simply
 * shows what the live page shows until there is unpublished work again. Parked
 * drafts are the one thing it never carries.
 *
 * Mirrors MotionKitConnector\Common\ShareLinks: same rows, same secret option,
 * same derivation. A token minted while the connector answered the editor still
 * resolves after the site drops to this plugin alone, and the other way round.
 *
 * @package MotionKit
 * @since 1.0.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

final class ShareLinks
{
    /**
     * Query parameter carrying the token on the customer's own site.
     */
    public const QUERY_PARAM = 'mk_share';

    /**
     * Key prefix the rows are stored under.
     */
    private const PAGE_SHARE_PREFIX = 'motionkit_pg_share_';

    /**
     * Key prefix a page's published animations are stored under.
     */
    private const PAGE_PUBLISHED_PREFIX = 'motionkit_pg_animation_';

    /**
     * Site-wide key the page tokens are derived from. Kept separate from
     * `motionkit_jwt_secret` so a share link and an editor session never share
     * key material — one leaking must not be the other leaking.
     */
    private const SHARE_SECRET_OPTION = 'motionkit_share_secret';

    /**
     * Hex characters kept from the derived digest. 22 is 88 bits, which is far
     * past guessable and short enough to sit in a URL a human will paste.
     */
    private const TOKEN_CHARS = 22;

    // ─── Lifecycle ───────────────────────────────────────────────────

    /**
     * Mint the page's share link.
     *
     * A link covers the PAGE, not a chosen set of animations: it renders
     * everything published, with every saved record standing in for its published
     * version by id. So there is nothing to name at mint time and nothing that can
     * make minting fail — a page whose work is all published still gets a working
     * link, it just shows the same thing the live page does.
     *
     * @param array               $page_type_config Descriptor for the page's animation key.
     * @param array<string,array> $animations       Working copies on the page, keyed by id.
     * @param string              $shared_version   Version stamp recorded on the row; nothing renders it today.
     * @return string|null Raw token, or null only when entropy was unavailable.
     */
    public static function create(array $page_type_config, array $animations, string $shared_version = ''): ?string
    {
        $snapshot = self::snapshot_for(array_keys($animations), $animations);

        $existing = self::rows($page_type_config);
        $row      = $existing[0] ?? [];

        // One row per page. A second would only ever be a duplicate of the first, and the token does not vary between them anyway.
        $row['animation_ids']  = array_keys($snapshot);
        $row['animations']     = $snapshot;
        $row['shared_version'] = $shared_version !== '' ? $shared_version : self::version_of($snapshot);
        $row['created_at']     = $row['created_at'] ?? time();
        // Expiry is not enforced; storing null now means turning it on later cannot invalidate links already handed out.
        $row['exp']            = $row['exp'] ?? null;

        self::save_rows($page_type_config, [$row]);

        return self::token_for($page_type_config);
    }

    /**
     * The page's token — derived, not stored.
     *
     * The page's storage descriptor is the identity — `option` already encodes the
     * page type and `id` the object — so it stays stable across renames and
     * permalink changes, which a URL would not.
     *
     * @param array $page_type_config Descriptor for the page's animation key.
     * @return string
     */
    private static function token_for(array $page_type_config): string
    {
        $identity = implode('|', [
            (string) ($page_type_config['store_type'] ?? ''),
            (string) ($page_type_config['option'] ?? ''),
            (string) ((int) ($page_type_config['id'] ?? 0)),
        ]);

        return substr(
            hash_hmac('sha256', $identity, self::secret()),
            0,
            self::TOKEN_CHARS
        );
    }

    /**
     * The site-wide key, created on first use.
     *
     * Rotating this option invalidates every share link on the site at once,
     * which is the only revocation there is today.
     *
     * @return string
     */
    private static function secret(): string
    {
        $secret = get_option(self::SHARE_SECRET_OPTION);
        if (is_string($secret) && strlen($secret) >= 32) {
            return $secret;
        }

        try {
            $secret = bin2hex(random_bytes(32));
        } catch (\Exception $e) {
            // random_bytes throws rather than returning weak entropy; wp_generate_password draws on the pool WordPress trusts for its own salts.
            $secret = wp_generate_password(64, true, true);
        }

        update_option(self::SHARE_SECRET_OPTION, $secret, false);

        return $secret;
    }

    /**
     * Match a raw token against this page's rows.
     *
     * @param array  $page_type_config Descriptor for the page's animation key.
     * @param string $token            Raw token from the query string.
     * @return ShareContext|null Null for unknown, revoked or expired tokens.
     */
    public static function resolve(array $page_type_config, string $token): ?ShareContext
    {
        if (!self::looks_like_token($token)) {
            return null;
        }

        // Recomputed from the page rather than compared against something stored. The row is still required — it carries the records — but it holds no secret, so a row leaking is not a link leaking.
        $expected = self::token_for($page_type_config);
        $now = time();

        foreach (self::rows($page_type_config) as $row) {
            if (!hash_equals($expected, $token)) {
                continue;
            }
            // Null expiry means never expires — that is today's only case, but the check is here so enabling expiry later needs no render-path change.
            if (isset($row['exp']) && $row['exp'] !== null && (int) $row['exp'] < $now) {
                return null;
            }

            return new ShareContext(
                isset($row['animation_ids']) && is_array($row['animation_ids']) ? $row['animation_ids'] : [],
                isset($row['animations']) && is_array($row['animations']) ? $row['animations'] : [],
                isset($row['shared_version']) && is_string($row['shared_version']) ? $row['shared_version'] : ''
            );
        }

        return null;
    }

    /**
     * Refresh the page's link with what the page holds now.
     *
     * Called from the save path, so the link always shows the last save. An
     * animation that has since been published or parked simply stops appearing in
     * the copy, which is enough — the published bucket already covers the first
     * case and the second is meant to be invisible.
     *
     * @param array               $page_type_config Descriptor for the page's animation key.
     * @param array<string,array> $live_drafts      Working copies on the page, keyed by id.
     * @return int Rows rewritten.
     */
    public static function reconcile(array $page_type_config, array $live_drafts): int
    {
        $rows = self::rows($page_type_config);
        if (empty($rows)) {
            return 0;
        }

        // Rebuilt from what the page holds NOW, not from the ids the row was minted with: a page-wide link is defined by the page, so an animation saved after the link was handed out belongs in it.
        $snapshot = self::snapshot_for(array_keys($live_drafts), $live_drafts);
        $rewritten = 0;

        foreach ($rows as $i => $row) {
            $before = $row;
            $row['animation_ids']  = array_keys($snapshot);
            $row['animations']     = $snapshot;
            $row['shared_version'] = self::version_of($snapshot);

            if ($row !== $before) {
                $rewritten++;
            }
            $rows[$i] = $row;
        }

        // An emptied snapshot does not kill the row: a page-wide link outlives "everything is published" and falls through to the published page on its own.
        if ($rewritten > 0) {
            self::save_rows($page_type_config, $rows);
        }

        return $rewritten;
    }

    // ─── Storage ─────────────────────────────────────────────────────

    /**
     * Rewrite a page type descriptor to point at the share key.
     *
     * @param array $animation_config Descriptor for the published key.
     * @return array
     */
    public static function share_config(array $animation_config): array
    {
        return AnimationResolver::reprefix($animation_config, self::PAGE_SHARE_PREFIX);
    }

    /**
     * @param array $page_type_config
     * @return array<int,array>
     */
    private static function rows(array $page_type_config): array
    {
        $raw = PageType::read(self::share_config($page_type_config));

        return array_values(array_filter($raw, 'is_array'));
    }

    /**
     * @param array $page_type_config
     * @param array $rows
     * @return void
     */
    private static function save_rows(array $page_type_config, array $rows): void
    {
        $config = self::share_config($page_type_config);

        if (empty($rows)) {
            PageType::delete($config);
            return;
        }

        PageType::write($config, array_values($rows));
    }

    // ─── Validation ──────────────────────────────────────────────────

    /**
     * Cheap shape check before any hashing or storage read.
     *
     * @param string $token
     * @return bool
     */
    private static function looks_like_token(string $token): bool
    {
        return (bool) preg_match('/^[a-f0-9]{' . self::TOKEN_CHARS . '}$/', $token);
    }

    /**
     * The records a row should carry, keyed by id, dropping ids with none.
     *
     * @param string[]            $ids     Ids the row claims.
     * @param array<string,array> $records Available records, keyed by id.
     * @return array<string,array>
     */
    private static function snapshot_for(array $ids, array $records): array
    {
        $out = [];
        foreach ($ids as $id) {
            if (!isset($records[$id]) || !is_array($records[$id])) {
                continue;
            }

            // A parked draft is left out: the link shows what is published plus what has been saved on top of it, and parking something is how the author says "not this one yet".
            if (AnimationResolver::status_of($records[$id]) === AnimationResolver::STATUS_DRAFT) {
                continue;
            }

            // Stored as `saved`, never `published` — this copy stands in for the live version only for someone holding the token.
            $out[$id] = AnimationResolver::with_status($records[$id], AnimationResolver::STATUS_SAVED);
        }
        return $out;
    }

    /**
     * Newest `updatedAt` across a row's records — the row's version stamp.
     *
     * Timestamps are ISO strings from the editor, so a string compare orders them
     * correctly without parsing; a record without one simply does not win.
     *
     * @param array<string,array> $records
     * @return string
     */
    private static function version_of(array $records): string
    {
        $newest = '';
        foreach ($records as $record) {
            $stamp = isset($record['updatedAt']) && is_string($record['updatedAt']) ? $record['updatedAt'] : '';
            if ($stamp > $newest) {
                $newest = $stamp;
            }
        }
        return $newest;
    }
}
