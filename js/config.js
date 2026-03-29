/* ============================================================
   WINGSNOB PLAYOFF — CONFIGURATION
   Fill in these values before going live.
   This is the ONLY file you need to edit for integrations.
   ============================================================ */

window.WINGSNOB_CONFIG = {

  // ── GoHighLevel ───────────────────────────────────────────
  GHL_API_KEY:     'pit-165c03d3-b703-4dc6-9f06-689247864ee3',
  GHL_LOCATION_ID: 'G1FQfOOaviS7nU1pnmvw',

  // Custom field IDs (created via setup script)
  GHL_FIELDS: {
    preferred_location: '3SZRja6JJ7eKjp2tLFAv',
    campaign_source:    '5wQ09KAapEQaJfqlweE3',
    campaign_name:      'Uc7LVJXrEj4cuY0OVokE',
    contest_entry:      'bhRFhljCWllzW2rzGs9Z',
  },

  // ── Google Analytics 4 ───────────────────────────────────
  // 1. analytics.google.com → Admin → Create Property
  // 2. Copy the Measurement ID (format: G-XXXXXXXXXX)
  GA4_ID: 'G-XXXXXXXXXX',

  // ── Campaign Settings ────────────────────────────────────
  CAMPAIGN:   'playoff-2026',
  PROMO_CODE: 'PLAYOFF6',

  // ── Order URL (fallback for non-location CTAs) ────────────
  ORDER_URL: 'https://order.wingsnob.ca',

};
