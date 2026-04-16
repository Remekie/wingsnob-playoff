#!/usr/bin/env node
/* ============================================================
   WINGSNOB PLAYOFF 2026 — GoHighLevel Auto-Setup
   Usage: node scripts/ghl-setup.js
   ============================================================ */

const API_KEY     = process.env.GHL_API_KEY     || 'pit-165c03d3-b703-4dc6-9f06-689247864ee3';
const LOCATION_ID = process.env.GHL_LOCATION_ID || 'G1FQfOOaviS7nU1pnmvw';
const BASE_URL    = 'https://services.leadconnectorhq.com';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type':  'application/json',
  'Version':       '2021-07-28',
};

async function ghl(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function ok(label)       { console.log(`  ✓ ${label}`); }
function fail(label, e)  { console.log(`  ✗ ${label}: ${e.message}`); }
function section(title)  { console.log(`\n── ${title} ${'─'.repeat(40 - title.length)}`); }

// ── STEP 1: Custom Fields ──────────────────────────────────
async function createCustomFields() {
  section('Custom Fields');

  const fields = [
    {
      name:     'preferred_location',
      dataType: 'SINGLE_OPTIONS',
      options: [
        'Edmonton - Brewery District',
        'Edmonton - Eversquare',
        'Edmonton - Northgate',
        'Edmonton - Meadows',
        'Edmonton - Manning',
        'Edmonton - Albany',
        'Edmonton - Rabbit Hill',
        'Edmonton - Hamptons',
        'Sherwood Park',
        'Leduc',
        'Calgary - Legacy',
      ],
    },
    { name: 'campaign_source',  dataType: 'TEXT' },
    { name: 'campaign_name',    dataType: 'TEXT' },
    { name: 'contest_entry',  dataType: 'SINGLE_OPTIONS', options: ['Yes', 'No'] },
    { name: 'code_redeemed',  dataType: 'SINGLE_OPTIONS', options: ['Yes', 'No'] },
    { name: 'ticket_winner',  dataType: 'SINGLE_OPTIONS', options: ['Yes', 'No'] },
  ];

  for (const field of fields) {
    try {
      const res = await ghl('POST', `/locations/${LOCATION_ID}/customFields`, field);
      ok(`${field.name}  →  id: ${res.customField?.id ?? '(check GHL)'}`);
    } catch (e) {
      // Field may already exist
      fail(field.name, e);
    }
  }
}

// ── STEP 2: Pipeline ───────────────────────────────────────
async function createPipeline() {
  section('Pipeline');

  const stages = [
    { name: 'New Entry',      position: 0 },
    { name: 'Email Sent',     position: 1 },
    { name: 'Engaged',        position: 2 },
    { name: 'Code Redeemed',  position: 3 },
    { name: 'Ticket Winner',  position: 4 },
  ];

  try {
    const res = await ghl('POST', `/opportunities/pipelines`, {
      name:       'Playoff 2026',
      locationId: LOCATION_ID,
      stages,
    });
    const id = res.pipeline?.id ?? res.id ?? '(check GHL)';
    ok(`Pipeline "Playoff 2026"  →  id: ${id}`);
    return id;
  } catch (e) {
    fail('Pipeline', e);
    return null;
  }
}

// ── STEP 3: Tags ───────────────────────────────────────────
// GHL creates tags on first use — pre-register them via a
// dummy contact so they appear in the tag picker immediately.
async function createTags() {
  section('Tags (pre-registering via temp contact)');

  const tags = [
    'playoff-2026',
    'contest-entrant',
    'location-brewery-district',
    'location-manning',
    'location-meadows',
    'location-northgate',
    'location-eversquare',
    'location-albany',
    'location-rabbit-hill',
    'location-hamptons',
    'location-sherwood-park',
    'location-leduc',
    'location-calgary-legacy',
    'source-qr',
    'source-ad',
    'source-social',
    'has-phone',
  ];

  // Create a temp contact to attach tags to
  let contactId;
  try {
    const res = await ghl('POST', `/contacts/`, {
      locationId: LOCATION_ID,
      firstName:  '__setup__',
      email:      `setup-delete-me@wingsnob-playoff.invalid`,
      tags,
    });
    contactId = res.contact?.id;
    ok(`Temp contact created with all ${tags.length} tags`);
  } catch (e) {
    fail('Tag pre-registration', e);
    console.log('    → Tags will still be created automatically on first form submission.');
    return;
  }

  // Delete the temp contact immediately
  if (contactId) {
    try {
      await ghl('DELETE', `/contacts/${contactId}`);
      ok('Temp contact deleted — tags now exist in GHL tag picker');
    } catch {
      console.log(`  ⚠  Delete temp contact manually (id: ${contactId})`);
    }
  }
}

// ── MAIN ───────────────────────────────────────────────────
async function main() {
  console.log('\n🏒  WingSnob Playoff 2026 — GHL Auto-Setup');
  console.log(`    Location: ${LOCATION_ID}\n`);

  await createCustomFields();
  await createPipeline();
  await createTags();

  console.log(`
── Next Steps ─────────────────────────────────────────────────
  1. Automations → New Workflow → Trigger: Inbound Webhook
     → Save trigger → copy the webhook URL
  2. Open js/config.js → paste webhook URL → push to GitHub
  3. Build the email sequences using GHL-SETUP.md (copy/paste ready)
  4. Send a test form submission → verify contact appears in GHL

  Full guide: GHL-SETUP.md
───────────────────────────────────────────────────────────────
`);
}

main().catch((e) => { console.error('\n❌ Fatal:', e.message); process.exit(1); });
