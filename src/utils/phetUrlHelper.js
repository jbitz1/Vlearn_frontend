/**
 * phetUrlHelper.js
 * 
 * Strict normalization and validation utility for PhET Interactive Simulations.
 * Strictly allows only legitimate PhET simulations hosted under phet.colorado.edu.
 * Arbitrary third-party URLs are rejected to prevent insecure embeds.
 */

const PHET_HOSTNAMES = new Set(['phet.colorado.edu', 'www.phet.colorado.edu']);

const NON_SIM_SLUGS = new Set([
  'filter',
  'browse',
  'categories',
  'new',
  'by-level',
  'translated',
  'about',
  'research',
  'index',
  'offline',
  'donate',
  'accessibility'
]);

/**
 * Normalizes any supported PhET catalog or HTML5 simulation URL into a canonical
 * PhET HTML5 simulation runner URL:
 * https://phet.colorado.edu/sims/html/<slug>/latest/<slug>_all.html
 * 
 * Rejects non-PhET URLs, invalid paths, and catalog navigation pages (returns null).
 * 
 * @param {string} rawUrl - Input URL or relative path from Content Studio
 * @returns {string|null} - Canonical PhET HTML5 player URL or null
 */
export function normalizePhetUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Handle relative paths starting with /en/simulations/ or /simulations/
  if (trimmed.startsWith('/')) {
    trimmed = 'https://phet.colorado.edu' + trimmed;
  } else if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith('phet.colorado.edu') || trimmed.startsWith('www.phet.colorado.edu')) {
      trimmed = 'https://' + trimmed;
    } else if (trimmed.startsWith('en/simulations/') || trimmed.startsWith('simulations/')) {
      trimmed = 'https://phet.colorado.edu/' + trimmed;
    } else {
      return null;
    }
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  // Hostname must strictly be phet.colorado.edu
  const host = parsed.hostname.toLowerCase();
  if (!PHET_HOSTNAMES.has(host)) {
    return null;
  }

  const pathname = parsed.pathname;

  // Pattern 1: Direct HTML5 player URL (e.g. /sims/html/<slug>/latest/<slug>_all.html or _en.html)
  // Example: https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html
  const directMatch = pathname.match(/^\/sims\/html\/([a-z0-9-]+)\/latest\/([a-z0-9-]+_(?:all|en)\.html)$/i);
  if (directMatch) {
    return `https://phet.colorado.edu${pathname}${parsed.search || ''}`;
  }

  // Pattern 2: General /sims/html/<slug>/... URL
  const genericSimsMatch = pathname.match(/^\/sims\/html\/([a-z0-9-]+)\/(.+)$/i);
  if (genericSimsMatch) {
    return `https://phet.colorado.edu${pathname}${parsed.search || ''}`;
  }

  // Pattern 3: PhET Catalog URL: /(?:[a-z]{2}(?:-[a-zA-Z]{2})?\/)?simulations\/(?:browse\/)?([a-z0-9-]+)\/?$/i
  // Examples:
  // - https://phet.colorado.edu/en/simulations/faradays-law
  // - https://phet.colorado.edu/simulations/charges-and-fields/
  // - /en/simulations/wave-interference
  const catalogMatch = pathname.match(/^(?:\/[a-z]{2}(?:-[a-zA-Z]{2})?)?\/simulations\/(?:browse\/)?([a-z0-9-]+)\/?$/i);
  if (catalogMatch) {
    const slug = catalogMatch[1].toLowerCase();
    if (NON_SIM_SLUGS.has(slug)) {
      return null;
    }
    return `https://phet.colorado.edu/sims/html/${slug}/latest/${slug}_all.html`;
  }

  return null;
}

/**
 * Checks whether a given string is a valid supported PhET simulation URL.
 * 
 * @param {string} rawUrl
 * @returns {boolean}
 */
export function isPhetSimulationUrl(rawUrl) {
  return Boolean(normalizePhetUrl(rawUrl));
}

/**
 * Extracts the simulation slug from a PhET URL if valid.
 * 
 * @param {string} rawUrl
 * @returns {string|null}
 */
export function extractPhetSlug(rawUrl) {
  const normalized = normalizePhetUrl(rawUrl);
  if (!normalized) return null;
  const match = normalized.match(/\/sims\/html\/([a-z0-9-]+)\//i);
  return match ? match[1].toLowerCase() : null;
}
