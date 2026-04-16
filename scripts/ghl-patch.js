#!/usr/bin/env node
/* ============================================================
   WINGSNOB — GHL Patch: utm_source, utm_medium fields +
   source-in-store, location-grande-prairie tags
   Usage: node scripts/ghl-patch.js
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

function ok(label)      { console.log(`  ✓ ${label}`); }
function fail(label, e) { console.log(`  ✗ ${label}: ${e.message}`); }

async function main() {
  console.log('\n🏒  WingSnob GHL Patch\n');

  // ── 1. Add utm_source custom field ─────────────────────────
  console.log('── Custom Fields ──────────────────────────────────────');
  for (const name of ['utm_source', 'utm_medium']) {
    try {
      const res = await ghl('POST', `/locations/${LOCATION_ID}/customFields`, {
        name,
        dataType: 'TEXT',
      });
      ok(`${name}  →  id: ${res.customField?.id ?? '(check GHL)'}`);
    } catch (e) {
      fail(name, e);
    }
  }

  // ── 2. Add missing tags via temp contact ───────────────────
  console.log('\n── Tags ───────────────────────────────────────────────');
  const newTags = ['source-in-store', 'location-grande-prairie'];

  let contactId;
  try {
    const res = await ghl('POST', `/contacts/`, {
      locationId: LOCATION_ID,
      firstName:  '__patch__',
      email:      `patch-delete-me@wingsnob-playoff.invalid`,
      tags:       newTags,
    });
    contactId = res.contact?.id;
    ok(`Tags registered: ${newTags.join(', ')}`);
  } catch (e) {
    fail('Tag registration', e);
  }

  if (contactId) {
    try {
      await ghl('DELETE', `/contacts/${contactId}`);
      ok('Temp contact deleted');
    } catch {
      console.log(`  ⚠  Delete temp contact manually (id: ${contactId})`);
    }
  }

  console.log(`
── Done ────────────────────────────────────────────────────────
  Next: open GHL Automations → Playoff 2026 workflow → add:
    Set custom field: utm_source  = {{utm_source}}
    Set custom field: utm_medium  = {{utm_medium}}
  And add tag condition: source-in-store when source = in-store
────────────────────────────────────────────────────────────────
`);
}

main().catch((e) => { console.error('\n❌ Fatal:', e.message); process.exit(1); });
