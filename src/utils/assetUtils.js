/**
 * Utility functions for LessonAsset and block media handling.
 * Ensures consistent detection of attached/present media across Content Studio,
 * Quality Bar, AI Review Panel, and Lesson Viewer.
 */

/**
 * Determines whether a LessonAsset contains valid attached media.
 * Returns true if the asset has:
 * - A status of 'attached', 'approved', 'ready', 'active', 'published', or 'generated'
 * - A non-empty URL
 * - An attached file
 * - Inline vector SVG or generated code in metadata
 * - A video ID, YouTube URL, or simulation key in metadata
 *
 * @param {Object} asset - The LessonAsset object
 * @returns {boolean}
 */
export function isAssetPresent(asset) {
    if (!asset || typeof asset !== 'object') return false;

    // 1. Normalized status check
    const status = String(asset.status || '').toLowerCase().trim();
    if (['attached', 'approved', 'ready', 'active', 'published', 'generated'].includes(status)) {
        return true;
    }

    // 2. Direct URL check (e.g. Wikimedia, CDN, YouTube, simulation embed)
    if (typeof asset.url === 'string' && asset.url.trim().length > 0) {
        return true;
    }

    // 3. File upload check
    if (asset.file) {
        return true;
    }

    // 4. Extensible metadata inspection (vector diagrams, code, video links, simulations)
    const meta = asset.metadata;
    if (meta && typeof meta === 'object') {
        if (
            (typeof meta.svg_content === 'string' && meta.svg_content.trim().length > 0) ||
            (typeof meta.svg === 'string' && meta.svg.trim().length > 0) ||
            (typeof meta.svg_code === 'string' && meta.svg_code.trim().length > 0) ||
            (typeof meta.generated_code === 'string' && meta.generated_code.trim().length > 0)
        ) {
            return true;
        }

        if (
            meta.video_id ||
            meta.resolved_video_id ||
            meta.youtube_url ||
            meta.playback_url ||
            meta.cloudflare_video_id
        ) {
            return true;
        }

        if (meta.simulation_key || meta.simulation_url) {
            return true;
        }
    }

    return false;
}

/**
 * Inspects a LessonBlock for direct/inline media attributes in `content` or `metadata`.
 * Handles legacy, ingested, or AI-generated blocks that store media directly on the block.
 *
 * @param {Object} block - The LessonBlock object
 * @returns {Object|null} Extracted media details or null
 */
export function getBlockMedia(block) {
    if (!block || typeof block !== 'object') return null;

    let content = block.content;
    if (typeof content === 'string') {
        try {
            content = JSON.parse(content);
        } catch {
            content = {};
        }
    }
    if (!content || typeof content !== 'object') content = {};

    let meta = block.metadata;
    if (typeof meta === 'string') {
        try {
            meta = JSON.parse(meta);
        } catch {
            meta = {};
        }
    }
    if (!meta || typeof meta !== 'object') meta = {};

    const url =
        content.url ||
        content.resolved_image_url ||
        content.image_url ||
        content.media_url ||
        content.youtube_url ||
        content.video_url ||
        content.playback_url ||
        meta.url ||
        meta.resolved_image_url ||
        meta.image_url ||
        meta.external_url;

    const svgCode =
        content.svg_content ||
        content.svg ||
        content.svg_code ||
        content.generated_code ||
        meta.svg_content ||
        meta.svg ||
        meta.svg_code ||
        meta.generated_code;

    const videoId =
        content.resolved_video_id ||
        content.video_id ||
        meta.resolved_video_id ||
        meta.video_id;

    const youtubeUrl = content.youtube_url || meta.youtube_url;
    const simKey = content.simulation_key || meta.simulation_key;

    if (url || svgCode || videoId || youtubeUrl || simKey) {
        return {
            url: url || youtubeUrl || null,
            svgCode: svgCode || null,
            videoId: videoId || null,
            simKey: simKey || null,
            title: content.title || block.title || '',
            caption: content.caption || content.description || '',
        };
    }

    return null;
}
