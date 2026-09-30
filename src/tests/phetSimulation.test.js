import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhetUrl, isPhetSimulationUrl, extractPhetSlug } from '../utils/phetUrlHelper.js';

test('1. Native simulations resolve to their native widget keys unchanged', () => {
  // A native simulation has no external PhET URL
  const nativeSimBlock = {
    title: "Charles's Law Investigation",
    block_type: 'suggested_simulation',
    metadata: {
      simulation_key: 'charles_law',
      archetype: 'charles_law',
      subject: 'CHEMISTRY',
    },
    assets: [],
  };

  const rawExternalUrl = nativeSimBlock.assets?.[0]?.url || nativeSimBlock.metadata?.url;
  const phetUrl = normalizePhetUrl(rawExternalUrl);

  assert.equal(phetUrl, null, 'Native simulations without PhET URLs must evaluate to null');

  // Verify native key is preserved
  const resolvedKey = phetUrl ? 'phet_external_simulation' : (nativeSimBlock.metadata.simulation_key || 'optics');
  assert.equal(resolvedKey, 'charles_law', 'Native simulation key should remain untouched');
});

test('2. Stored PhET URL on block.assets[0].url is detected and passed to simObject config', () => {
  const phetBlock = {
    title: "Faraday's Electromagnetic Lab",
    block_type: 'suggested_simulation',
    metadata: {
      subject: 'PHYSICS',
      concept_group: 'Electromagnetism',
    },
    assets: [
      {
        id: 42,
        asset_type: 'simulation',
        storage_type: 'url',
        url: 'https://phet.colorado.edu/en/simulations/faradays-law',
      },
    ],
  };

  const asset = phetBlock.assets[0];
  const rawExternalUrl = asset?.url || phetBlock.metadata?.url;
  const phetUrl = normalizePhetUrl(rawExternalUrl);

  assert.ok(phetUrl, 'Should detect valid PhET URL on block.assets[0].url');
  assert.equal(
    phetUrl,
    'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html'
  );

  // Construct simObject identical to InteractiveSimulationBlock logic
  const simObject = {
    title: phetBlock.title || 'PhET Interactive Simulation',
    key: 'phet_external_simulation',
    archetype: 'phet_external_simulation',
    subject: phetBlock.metadata.subject,
    topic: phetBlock.metadata.concept_group,
    is_phet: true,
    url: phetUrl,
    external_url: phetUrl,
    config: {
      url: phetUrl,
      external_url: phetUrl,
      is_phet: true,
    },
  };

  assert.equal(simObject.key, 'phet_external_simulation');
  assert.equal(simObject.is_phet, true);
  assert.equal(simObject.config.external_url, phetUrl);
  assert.equal(simObject.config.url, phetUrl);
  assert.equal(simObject.config.is_phet, true);
});

test('3. Supported PhET URL resolves and extracts correct slug', () => {
  const url1 = 'https://phet.colorado.edu/en/simulations/faradays-law';
  assert.equal(isPhetSimulationUrl(url1), true);
  assert.equal(extractPhetSlug(url1), 'faradays-law');

  const url2 = 'https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_all.html';
  assert.equal(isPhetSimulationUrl(url2), true);
  assert.equal(extractPhetSlug(url2), 'charges-and-fields');
});

test('4. PhET catalog URLs normalize to canonical HTML5 player URLs', () => {
  // English catalog page
  assert.equal(
    normalizePhetUrl('https://phet.colorado.edu/en/simulations/faradays-law'),
    'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html'
  );

  // Relative path from Content Studio
  assert.equal(
    normalizePhetUrl('/en/simulations/wave-interference'),
    'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html'
  );

  // URL without language prefix and with trailing slash
  assert.equal(
    normalizePhetUrl('https://phet.colorado.edu/simulations/circuit-construction-kit-dc/'),
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html'
  );

  // Direct HTML5 runner URL is preserved
  assert.equal(
    normalizePhetUrl('https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_all.html'),
    'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_all.html'
  );
});

test('5. Unsupported, non-PhET, or arbitrary third-party URLs return null and are NOT embedded', () => {
  // Arbitrary external domains
  assert.equal(normalizePhetUrl('https://malicious.com/simulation'), null);
  assert.equal(normalizePhetUrl('https://phet.colorado.edu.attacker.net/sim'), null);
  assert.equal(normalizePhetUrl('https://google.com'), null);

  // PhET catalog navigation / filter pages that are not simulations
  assert.equal(normalizePhetUrl('https://phet.colorado.edu/en/simulations/filter'), null);
  assert.equal(normalizePhetUrl('https://phet.colorado.edu/en/simulations/browse'), null);
  assert.equal(normalizePhetUrl('https://phet.colorado.edu/en/simulations/categories'), null);
  assert.equal(normalizePhetUrl('https://phet.colorado.edu/en/about'), null);

  // Injections and empty inputs
  assert.equal(normalizePhetUrl('javascript:alert(1)'), null);
  assert.equal(normalizePhetUrl(''), null);
  assert.equal(normalizePhetUrl(null), null);
  assert.equal(normalizePhetUrl(undefined), null);
});
