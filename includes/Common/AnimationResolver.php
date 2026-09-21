<?php

namespace MotionKit\Common;

/**
 * Single entry point for "which animations does this request render?".
 *
 * Every read of the animation buckets goes through here. Each bucket is stored
 * as a published/draft pair — `motionkit_pg_animation_<type>` next to
 * `motionkit_pg_draft_<type>`, and `motionkit_global_animations` next to
 * `motionkit_global_animations_draft`. Only the published half is ever sent to
 * a visitor, which is what keeps drafts out of every page's HTML.
 *
 * Three audiences, three methods:
 *  - published()  → public visitors
 *  - for_editor() → the editor, which wants both halves stitched back together
 *  - for_share()  → a share link, which is published plus the link's own copies
 *
 * Mirrors MotionKitConnector\Common\AnimationResolver key for key and state for
 * state. The two plugins can be active on one site and read the same rows, so
 * a record either one wrote has to resolve the same way under the other.
 *
 * @package MotionKit
 * @since 1.0.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

final class AnimationResolver
{
    /**
     * Published global animation bucket.
     */
    public const GLOBAL_PUBLISHED_OPTION = 'motionkit_global_animations';

    /**
     * Draft global animation bucket. Read only for the editor and share links.
     */
    public const GLOBAL_DRAFT_OPTION = 'motionkit_global_animations_draft';

    /**
     * Key prefix a page's published animations are stored under.
     */
    private const PAGE_PUBLISHED_PREFIX = 'motionkit_pg_animation_';

    /**
     * Key prefix a page's draft animations are stored under.
     */
    private const PAGE_DRAFT_PREFIX = 'motionkit_pg_draft_';

    /**
     * Field carrying an animation's working copy on the wire.
     *
     * The editor sends one list where a published animation may carry its
     * unpublished edits under this key. Storage splits the two apart; reads for
     * the editor put them back.
     */
    public const DRAFT_FIELD = 'draft';

    /**
     * Field carrying an animation's lifecycle state.
     */
    public const STATUS_FIELD = 'status';

    /**
     * Parked. Never live, and the editor leaves it out of playback unless it is
     * the animation actually open. A share link does not carry it either.
     */
    public const STATUS_DRAFT = 'draft';

    /**
     * Saved but not live. Runs in the editor and behind a share link; a visitor
     * without a token never sees it.
     */
    public const STATUS_SAVED = 'saved';

    /**
     * Every visitor gets it.
     */
    public const STATUS_PUBLISHED = 'published';

    /**
     * What the previous model called a record a share link pointed at. It was
     * never live and it played wherever it was sent, which is what `saved` means
     * now, so it maps straight across on read.
     */
    private const LEGACY_PREVIEW = 'preview';

    /**
     * Per-request memo for the global buckets, keyed by option name.
     *
     * @var array<string,array>
     */
    private static array $global_cache = [];

    // ─── Audiences ───────────────────────────────────────────────────

    /**
     * What a public visitor renders — published entries only.
     *
     * @param array $page_type_config Descriptor from PageType::current().
     * @return array
     */
    public static function published(array $page_type_config): array
    {
        // Page first, then global — the order the frontend has always merged in, and the runtime plays in list order.
        $published = array_merge(
            self::split(self::page_bucket($page_type_config))['published'],
            self::split(self::global_bucket(self::GLOBAL_PUBLISHED_OPTION))['published']
        );

        // A record saved before the split kept its working copy inline; a visitor has no use for it and must not download it.
        foreach ($published as $i => $entry) {
            unset($published[$i][self::DRAFT_FIELD]);
        }

        return $published;
    }

    /**
     * What the editor loads — one list per bucket, working copies re-attached.
     *
     * @param array $page_type_config Descriptor from PageType::current().
     * @return array{global: array, page: array}
     */
    public static function for_editor(array $page_type_config): array
    {
        return [
            'global' => self::global_for_editor(),
            'page'   => self::page_for_editor($page_type_config),
        ];
    }

    /**
     * The global bucket as the editor wants it — the half `get_settings` returns.
     *
     * @return array
     */
    public static function global_for_editor(): array
    {
        return self::stitch(
            self::global_bucket(self::GLOBAL_PUBLISHED_OPTION),
            self::global_bucket(self::GLOBAL_DRAFT_OPTION)
        );
    }

    /**
     * The page bucket as the editor wants it.
     *
     * @param array $page_type_config Descriptor from PageType::current().
     * @return array
     */
    public static function page_for_editor(array $page_type_config): array
    {
        return self::stitch(
            self::page_bucket($page_type_config),
            self::page_bucket($page_type_config, true)
        );
    }

    /**
     * What a share link renders — everything published, plus the records the
     * link itself carries, standing in for their published versions.
     *
     * The overlay comes from the share row, never from the draft bucket: a
     * front-end request must not be able to reach unpublished storage even with a
     * valid token, so the only unpublished data on this path is the copy the link
     * owns. An emptied link therefore falls through to the live page on its own.
     *
     * @param array        $page_type_config Descriptor from PageType::current().
     * @param ShareContext $share            Validated share row.
     * @return array
     */
    public static function for_share(array $page_type_config, ShareContext $share): array
    {
        $published = self::published($page_type_config);

        $overlay = $share->animations();

        if (empty($overlay)) {
            return $published;
        }

        // Stamped `saved` rather than `published`: the runtime plays both, so the record can go out telling the truth about itself instead of pretending to be live.
        foreach ($overlay as $id => $entry) {
            $entry = self::with_status($entry, self::STATUS_SAVED);
            $entry['_mkDraft'] = true;
            $overlay[$id] = $entry;
        }

        // array_replace keeps position for ids already published (the copy stands in place) and appends ids that were never published.
        return array_values(array_replace(self::index_by_id($published), $overlay));
    }

    /**
     * Every unpublished working copy on this page, both buckets.
     *
     * @param array $page_type_config Descriptor from PageType::current().
     * @return array
     */
    public static function drafts(array $page_type_config): array
    {
        return array_merge(
            self::global_bucket(self::GLOBAL_DRAFT_OPTION),
            self::split(self::global_bucket(self::GLOBAL_PUBLISHED_OPTION))['drafts'],
            self::page_bucket($page_type_config, true),
            self::split(self::page_bucket($page_type_config))['drafts']
        );
    }

    /**
     * The same working copies keyed by animation id — the shape share rows copy from.
     *
     * @param array $page_type_config Descriptor from PageType::current().
     * @return array<string,array>
     */
    public static function drafts_by_id(array $page_type_config): array
    {
        return self::index_by_id(self::drafts($page_type_config));
    }

    // ─── Storage split ───────────────────────────────────────────────

    /**
     * Split an editor-shaped list into the two buckets storage keeps.
     *
     * @param array $entries List as the editor sends it.
     * @return array{published: array, drafts: array}
     */
    public static function partition_for_storage(array $entries): array
    {
        $published = [];
        $drafts = [];

        foreach ($entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            $working = isset($entry[self::DRAFT_FIELD]) && is_array($entry[self::DRAFT_FIELD])
                ? $entry[self::DRAFT_FIELD]
                : null;
            unset($entry[self::DRAFT_FIELD]);

            // Never published — it has no live counterpart, so the whole record is the draft.
            if (!self::is_published($entry)) {
                $drafts[] = self::as_draft($entry);
                continue;
            }

            $published[] = self::with_status($entry, self::STATUS_PUBLISHED);

            if ($working !== null) {
                // Whole record, not a property diff — that is what makes add/delete/update of any field automatic.
                $drafts[] = self::as_draft(array_replace($entry, $working));
            }
        }

        return ['published' => $published, 'drafts' => $drafts];
    }

    /**
     * Put a stored pair back into the single list the editor works with.
     *
     * Every record is stamped with the state it resolves to on the way out, so an
     * animation saved before `status` existed arrives in the editor already
     * carrying it — opening the page is enough, no edit required.
     *
     * @param mixed $published_bucket Raw published bucket.
     * @param mixed $draft_bucket     Raw draft bucket.
     * @return array
     */
    public static function stitch($published_bucket, $draft_bucket): array
    {
        $split = self::split(is_array($published_bucket) ? $published_bucket : []);
        $drafts = self::index_by_id(array_merge(
            is_array($draft_bucket) ? $draft_bucket : [],
            $split['drafts']
        ));

        $out = [];
        foreach ($split['published'] as $entry) {
            $id = self::entry_id($entry);
            $entry = self::with_status($entry, self::STATUS_PUBLISHED);

            if ($id !== null && isset($drafts[$id])) {
                // `status` stays on the working copy — a published animation's edits are themselves either draft or saved, and that is the question the card badge answers.
                $working = self::as_draft($drafts[$id]);
                unset($working[self::DRAFT_FIELD]);
                $entry[self::DRAFT_FIELD] = $working;
                unset($drafts[$id]);
            }
            $out[] = $entry;
        }

        // Whatever is left never had a published counterpart — those are ordinary drafts.
        return array_merge($out, array_map([self::class, 'as_draft'], array_values($drafts)));
    }

    /**
     * Separate a bucket's published entries from unpublished ones.
     *
     * Sites saved before the draft key existed keep both kinds in the published
     * bucket, so this runs on every read rather than as a one-off migration —
     * a half-migrated site still resolves correctly.
     *
     * @param mixed $bucket Raw stored bucket.
     * @return array{published: array, drafts: array}
     */
    public static function split($bucket): array
    {
        if (!is_array($bucket)) {
            return ['published' => [], 'drafts' => []];
        }

        $published = [];
        $drafts = [];
        foreach ($bucket as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            if (self::is_published($entry)) {
                $published[] = $entry;
            } else {
                $drafts[] = $entry;
            }
        }

        return ['published' => $published, 'drafts' => $drafts];
    }

    // ─── Bucket reads ────────────────────────────────────────────────

    /**
     * Read a global bucket, memoized per request.
     *
     * @param string $option Option name.
     * @return array
     */
    public static function global_bucket(string $option): array
    {
        if (array_key_exists($option, self::$global_cache)) {
            return self::$global_cache[$option];
        }

        $raw = get_option($option, []);
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }

        return self::$global_cache[$option] = is_array($raw) ? $raw : [];
    }

    /**
     * Drop the global memo after a write, so a later read in the same request sees it.
     *
     * @return void
     */
    public static function forget_globals(): void
    {
        self::$global_cache = [];
    }

    /**
     * Read a page bucket for the given page type.
     *
     * @param array $page_type_config Descriptor from PageType::current().
     * @param bool  $draft            Read the draft key instead of the published one.
     * @return array
     */
    public static function page_bucket(array $page_type_config, bool $draft = false): array
    {
        $config = $draft ? self::draft_config($page_type_config) : $page_type_config;

        return PageType::read($config);
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    /**
     * Rewrite a page type descriptor to point at the draft key.
     *
     * @param array $animation_config Descriptor for the published key.
     * @return array
     */
    public static function draft_config(array $animation_config): array
    {
        return self::reprefix($animation_config, self::PAGE_DRAFT_PREFIX);
    }

    /**
     * Swap the animation prefix on a descriptor's option name for another.
     *
     * @param array  $config
     * @param string $prefix
     * @return array
     */
    public static function reprefix(array $config, string $prefix): array
    {
        if (!empty($config['option']) && is_string($config['option'])) {
            $config['option'] = preg_replace(
                '/^' . preg_quote(self::PAGE_PUBLISHED_PREFIX, '/') . '/',
                $prefix,
                $config['option']
            );
        }
        return $config;
    }

    /**
     * Which of the three states a node is in.
     *
     * `status` wins when it holds one of the three values, and `isPublished` is
     * read when it does not. That second half is the whole migration: every
     * record written before this field existed resolves exactly as it did before,
     * so no pass over stored data is needed.
     *
     * @param mixed $node Animation entry or timeline step.
     * @return string One of the STATUS_* constants.
     */
    public static function status_of($node): string
    {
        if (!is_array($node)) {
            return self::STATUS_PUBLISHED;
        }

        $status = $node[self::STATUS_FIELD] ?? null;
        if ($status === self::STATUS_DRAFT || $status === self::STATUS_SAVED || $status === self::STATUS_PUBLISHED) {
            return $status;
        }

        if ($status === self::LEGACY_PREVIEW) {
            return self::STATUS_SAVED;
        }

        // A missing flag means published, matching the runtime — only a literal false unpublishes.
        if (!array_key_exists('isPublished', $node) || $node['isPublished'] !== false) {
            return self::STATUS_PUBLISHED;
        }

        // Resolves to `saved`, not `draft`: an older build's not-live record was ordinary saved work the editor played, and reading it as parked would silently stop something the user has been seeing.
        return self::STATUS_SAVED;
    }

    /**
     * Stamp a node with a state.
     *
     * `status` is the only field written. The legacy `isPublished` boolean is
     * actively dropped rather than kept in step, so a record stops carrying two
     * answers to the same question the first time it is saved.
     *
     * @param array  $node
     * @param string $status One of the STATUS_* constants.
     * @return array
     */
    public static function with_status(array $node, string $status): array
    {
        // Removed before being re-added so the field always lands at the tail, whatever order it arrived in; otherwise a stitched record reorders its keys on the next save and every future diff carries the noise.
        unset($node[self::STATUS_FIELD], $node['isPublished']);

        $node[self::STATUS_FIELD] = $status;

        return $node;
    }

    /**
     * A record as it belongs in the draft bucket.
     *
     * Keeps whichever of the two unpublished states the editor sent, and collapses
     * everything else to `saved`. `published` can never survive into this bucket —
     * a record only reaches here because it is not live, or because it is the
     * working copy of one that is.
     *
     * @param array $entry
     * @return array
     */
    public static function as_draft(array $entry): array
    {
        $status = self::status_of($entry);

        return self::with_status(
            $entry,
            $status === self::STATUS_DRAFT ? self::STATUS_DRAFT : self::STATUS_SAVED
        );
    }

    /**
     * Whether a node should render for an ordinary visitor.
     *
     * @param mixed $node Animation entry or timeline step.
     * @return bool
     */
    public static function is_published($node): bool
    {
        return self::status_of($node) === self::STATUS_PUBLISHED;
    }

    /**
     * An entry's animation id, or null when it has no usable one.
     *
     * @param mixed $entry
     * @return string|null
     */
    public static function entry_id($entry): ?string
    {
        if (!is_array($entry) || !isset($entry['id']) || !is_string($entry['id']) || $entry['id'] === '') {
            return null;
        }
        return $entry['id'];
    }

    /**
     * Key a list by animation id, dropping entries without one.
     *
     * @param array $entries
     * @return array<string,array>
     */
    private static function index_by_id(array $entries): array
    {
        $out = [];
        foreach ($entries as $entry) {
            $id = self::entry_id($entry);
            if ($id !== null) {
                $out[$id] = $entry;
            }
        }
        return $out;
    }
}
