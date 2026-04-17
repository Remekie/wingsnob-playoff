/* ============================================================
   WINGSNOB PLAYOFF MODE — main.js
   Form handling, GA4, localStorage, URL params, FAQ
   ============================================================ */

// ── CONFIG — values come from js/config.js ────────────────
const _cfg            = window.WINGSNOB_CONFIG || {};
const GHL_WEBHOOK_URL = _cfg.GHL_WEBHOOK_URL || 'YOUR_GHL_WEBHOOK_URL';
const CAMPAIGN        = _cfg.CAMPAIGN        || 'playoff-2026';
const PROMO_CODE      = _cfg.PROMO_CODE      || 'PLAYOFF6';
const ORDER_URL       = _cfg.ORDER_URL       || 'https://order.wingsnob.ca';
const LS_KEY          = 'wingsnob_playoff_signup';

// ── URL PARAMS ────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const DEBUG_MODE    = params.get('debug') === '1';
const urlSource     = params.get('source')       || 'direct';
const utmSource     = params.get('utm_source')   || '';
const utmMedium     = params.get('utm_medium')   || '';
const utmCampaign   = params.get('utm_campaign') || '';
const utmContent    = params.get('utm_content')  || '';

// GA4 loaded via static <script> tag in <head> (required for Search Console verification)

// ── DEBUG OVERLAY (only active when ?debug=1) ─────────────
function debugLog(label, value, isError = false) {
  if (!DEBUG_MODE) return;
  let panel = document.getElementById('debug-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:9999;
      background:#000;color:#0f0;font-family:monospace;font-size:12px;
      padding:12px;max-height:50vh;overflow-y:auto;
      border-top:2px solid #0f0;
    `;
    document.body.appendChild(panel);
  }
  const line = document.createElement('div');
  line.style.color = isError ? '#f66' : '#0f0';
  line.style.marginBottom = '4px';
  line.textContent = `[${new Date().toISOString().slice(11,19)}] ${label}: ${typeof value === 'object' ? JSON.stringify(value) : value}`;
  panel.appendChild(line);
  panel.scrollTop = panel.scrollHeight;
}

function ga4(event, data = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, data);
  }
}

// ── LOCATIONS DATA ────────────────────────────────────────
const LOCATIONS = [
  { key: 'Edmonton - Brewery District', lat: 53.5461, lng: -113.5097, skip: 'https://www.skipthedishes.com/wing-snob' },
  { key: 'Edmonton - Eversquare',       lat: 53.4960, lng: -113.5040, skip: 'https://www.skipthedishes.com/wing-snob-eversquare' },
  { key: 'Edmonton - Northgate',        lat: 53.5957, lng: -113.5260, skip: 'https://www.skipthedishes.com/wing-snob-137-avenue' },
  { key: 'Edmonton - Meadows',          lat: 53.4550, lng: -113.3900, skip: 'https://www.skipthedishes.com/wing-snob-38' },
  { key: 'Edmonton - Manning',          lat: 53.5950, lng: -113.4540, skip: 'https://www.skipthedishes.com/wing-snob-nw' },
  { key: 'Edmonton - Albany',           lat: 53.6410, lng: -113.5060, skip: 'https://www.skipthedishes.com/wing-snob-167-avenue' },
  { key: 'Edmonton - Rabbit Hill',      lat: 53.4530, lng: -113.5700, skip: 'https://www.skipthedishes.com/wing-snob-5116' },
  { key: 'Edmonton - Hamptons',         lat: 53.5290, lng: -113.6580, skip: 'https://www.skipthedishes.com/wing-snob-lessard-road' },
  { key: 'Sherwood Park',               lat: 53.5350, lng: -113.3140, skip: 'https://www.skipthedishes.com/wing-snob-sherwood-drive' },
  { key: 'Leduc',                       lat: 53.2730, lng: -113.5490, skip: 'https://www.skipthedishes.com/wing-snob-discovery-way' },
  { key: 'Calgary - Legacy',            lat: 50.8840, lng: -113.9820, skip: 'https://www.skipthedishes.com/wing-snob-legacy-main-street' },
  { key: 'Grande Prairie',              lat: 55.1707, lng: -118.7885, skip: 'https://www.skipthedishes.com/wing-snob-grande-prairie' },
];

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ga4('page_view', {
    source: urlSource,
    utm_source: utmSource,
    campaign: CAMPAIGN,
  });

  populateHiddenFields();
  populateLocationSelect();
  checkReturningVisitor();
  initForm();
  initFAQ();
  initOrderButtons();
  initNavScrollEffect();
  initGeoSort();
  initKeyboardDetection();
  initLocationCollapse();
});

// ── LOCATION SELECT ───────────────────────────────────────
function populateLocationSelect() {
  const select = document.getElementById('field-location');
  if (!select) return;
  LOCATIONS.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc.key;
    opt.textContent = loc.key;
    select.appendChild(opt);
  });
}

// ── HIDDEN FIELDS ─────────────────────────────────────────
function populateHiddenFields() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('field-campaign',    CAMPAIGN);
  set('field-source',      urlSource);
  set('field-utm-source',  utmSource);
  set('field-utm-medium',  utmMedium);
  set('field-utm-campaign',utmCampaign);
  set('field-utm-content', utmContent);
}

// ── RETURNING VISITOR ─────────────────────────────────────
function checkReturningVisitor() {
  const existing = localStorage.getItem(LS_KEY);
  if (!existing) return;

  let data;
  try { data = JSON.parse(existing); } catch { localStorage.removeItem(LS_KEY); return; }

  const formCard     = document.getElementById('signup-form-card');
  const welcomeBack  = document.getElementById('welcome-back');

  if (formCard)    formCard.style.display = 'none';
  if (welcomeBack) {
    welcomeBack.classList.add('visible');
    const nameEl = welcomeBack.querySelector('.wb-name');
    if (nameEl && data.first_name) nameEl.textContent = data.first_name;
  }
}

// ── FORM ──────────────────────────────────────────────────
function initForm() {
  const form   = document.getElementById('signup-form');
  const btn    = document.getElementById('signup-btn');
  if (!form || !btn) return;

  // Track form start on first focus
  let formStarted = false;
  form.addEventListener('focusin', () => {
    if (!formStarted) {
      formStarted = true;
      ga4('form_start');
    }
  });

  // Debounce guard
  let submitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;

    clearErrors();
    if (!validateForm(form)) return;

    submitting = true;
    btn.classList.add('is-loading');
    btn.disabled = true;

    const payload = buildPayload(form);
    debugLog('payload', payload);

    try {
      if (GHL_WEBHOOK_URL !== 'YOUR_GHL_WEBHOOK_URL') {
        debugLog('webhook', 'sending...');
        let res;
        try {
          const minDelay = new Promise(r => setTimeout(r, 600));
          [res] = await Promise.all([
            fetch(GHL_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams(payload).toString(),
            }),
            minDelay,
          ]);
        } catch (fetchErr) {
          debugLog('fetch error', fetchErr.message, true);
          throw new Error('network');
        }
        const responseText = await res.text();
        debugLog('status', res.status, !res.ok);
        debugLog('response', responseText, !res.ok);
        if (!res.ok) {
          const err = new Error(`GHL webhook failed: ${res.status}`);
          err.status = res.status;
          throw err;
        }
      } else {
        debugLog('webhook', 'URL not configured — skipping', true);
      }

      // Save to localStorage
      localStorage.setItem(LS_KEY, JSON.stringify(payload));

      // GA4
      ga4('playoff_signup', {
        source: payload.source,
        location: payload.preferred_location,
        has_phone: !!payload.phone,
      });

      debugLog('result', 'SUCCESS — showing confirmation');
      showConfirmation(payload.first_name);
    } catch (err) {
      console.error('Submission error:', err);
      debugLog('caught error', err.message, true);
      if (err.message === 'network') {
        showInlineError('Connection failed — check your internet and try again.');
      } else if (err.status >= 400 && err.status < 500) {
        showInlineError('Your entry couldn\'t be processed. Please email us at info@wingsnob.ca.');
      } else {
        showInlineError('Something went wrong on our end — please try again in a moment.');
      }
    } finally {
      submitting = false;
      btn.classList.remove('is-loading');
      btn.disabled = false;
    }
  });
}

function buildPayload(form) {
  const get = (id) => { const el = form.querySelector(`#${id}`); return el ? el.value.trim() : ''; };
  return {
    first_name:        get('field-name'),
    email:             get('field-email'),
    phone:             get('field-phone') || null,
    preferred_location:get('field-location'),
    campaign:          CAMPAIGN,
    source:            urlSource,
    utm_source:        utmSource,
    utm_medium:        utmMedium,
    utm_campaign:      utmCampaign,
    utm_content:       utmContent,
  };
}

function validateForm(form) {
  let valid = true;

  const name  = form.querySelector('#field-name');
  const email = form.querySelector('#field-email');
  const loc   = form.querySelector('#field-location');

  if (!name.value.trim()) {
    showFieldError(name, 'Your first name is required');
    valid = false;
  }
  if (!email.value.trim()) {
    showFieldError(email, 'Email address is required');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showFieldError(email, 'Please enter a valid email address');
    valid = false;
  }
  if (!loc.value) {
    showFieldError(loc, 'Please select your nearest location');
    valid = false;
  }

  return valid;
}

function showFieldError(input, msg) {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const errEl = group.querySelector('.form-error');
  if (errEl) errEl.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
}

function showInlineError(msg) {
  const el = document.getElementById('form-global-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showConfirmation(firstName) {
  const formInner = document.getElementById('form-inner');
  const confirm   = document.getElementById('form-confirmation');
  if (formInner) formInner.style.display = 'none';
  if (confirm)   confirm.classList.add('visible');

  const nameEl = confirm && confirm.querySelector('.confirm-name');
  if (nameEl && firstName) nameEl.textContent = `, ${firstName}`;
}

// ── FAQ ───────────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const wasOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq__item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        ga4('faq_expand', { question: btn.textContent.trim().slice(0, 60) });
      }
    });
  });
}

// ── ORDER BUTTONS ─────────────────────────────────────────
function initOrderButtons() {
  document.querySelectorAll('[data-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      ga4('order_click', { button_location: btn.dataset.order || 'unknown' });
      // href/target="_blank" handles navigation — no window.open needed
    });
  });
}

// ── NAV SCROLL ────────────────────────────────────────────
function initNavScrollEffect() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── KEYBOARD DETECTION (hide sticky bar when keyboard open) ──
function initKeyboardDetection() {
  const sticky = document.querySelector('.mobile-sticky');
  if (!sticky) return;

  // Use visualViewport API — most reliable method across iOS/Android
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const keyboardOpen = window.visualViewport.height < window.innerHeight * 0.75;
      sticky.classList.toggle('keyboard-open', keyboardOpen);
    });
  } else {
    // Fallback: detect focus/blur on inputs
    document.querySelectorAll('.form-input, .form-select').forEach(el => {
      el.addEventListener('focus', () => sticky.classList.add('keyboard-open'));
      el.addEventListener('blur',  () => {
        setTimeout(() => sticky.classList.remove('keyboard-open'), 200);
      });
    });
  }
}

// ── GEO SORT ─────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function initGeoSort() {
  const select = document.getElementById('field-location');
  if (!select) return;

  // Meta in-app browser (IG/FB) often blocks geolocation silently
  // Detect it and show a manual detect button instead
  const isMetaWebview = /FBAN|FBAV|Instagram/.test(navigator.userAgent);

  if (!navigator.geolocation || isMetaWebview) {
    // Show a "Detect my location" button above the dropdown
    injectGeoButton(select);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => applyGeoSort(coords.latitude, coords.longitude),
    () => {
      // Denied — show manual button as fallback
      const placeholder = select.querySelector('option[disabled]');
      if (placeholder) placeholder.textContent = 'Select your nearest location';
      injectGeoButton(select);
    },
    { timeout: 6000, maximumAge: 300000 }
  );
}

function injectGeoButton(select) {
  // Don't inject twice
  if (document.getElementById('geo-btn')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'geo-btn';
  btn.className = 'geo-btn';
  btn.textContent = 'Detect my nearest location';
  btn.setAttribute('aria-label', 'Detect my nearest Wing Snob location');

  btn.addEventListener('click', () => {
    btn.textContent = 'Detecting…';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        applyGeoSort(coords.latitude, coords.longitude);
        btn.remove();
      },
      () => {
        btn.textContent = 'Could not detect — select manually';
        btn.disabled = false;
      },
      { timeout: 8000 }
    );
  });

  select.parentNode.insertBefore(btn, select);
}

function applyGeoSort(lat, lng) {
  const select = document.getElementById('field-location');
  if (!select) return;

  const sorted = LOCATIONS.map(loc => ({
    ...loc,
    dist: haversineKm(lat, lng, loc.lat, loc.lng),
  })).sort((a, b) => a.dist - b.dist);

  const nearest = sorted[0];
  const placeholder = select.querySelector('option[disabled]');
  select.innerHTML = '';
  if (placeholder) {
    placeholder.textContent = 'Select your location';
    select.appendChild(placeholder);
  }

  sorted.forEach((loc, i) => {
    const opt = document.createElement('option');
    opt.value = loc.key;
    const distLabel = loc.dist < 1
      ? `${Math.round(loc.dist * 1000)}m`
      : `${loc.dist.toFixed(1)}km`;
    opt.textContent = i === 0
      ? `${loc.key.replace('Edmonton - ', '')} (${distLabel} — Nearest)`
      : `${loc.key.replace('Edmonton - ', '')} (${distLabel})`;
    select.appendChild(opt);
  });

  select.value = nearest.key;

  // Badge on location card
  const grid = document.getElementById('locations-grid');
  if (grid) {
    const nearestCard = grid.querySelector(`[data-location-key="${nearest.key}"]`);
    if (nearestCard) {
      nearestCard.classList.add('is-nearest');
      const badge = nearestCard.querySelector('.nearest-badge');
      if (badge) badge.hidden = false;
      grid.prepend(nearestCard);
    }
  }
}

// ── LOCATION COLLAPSE (mobile) ────────────────────────────
function initLocationCollapse() {
  const grid = document.getElementById('locations-grid');
  const btn  = document.getElementById('locations-show-more');
  if (!grid || !btn) return;

  function collapseCards() {
    if (window.innerWidth > 767) return;
    const cards = grid.querySelectorAll('.location-card');
    cards.forEach((card, i) => {
      card.classList.toggle('is-collapsed', i >= 3);
    });
  }

  collapseCards();
  window.addEventListener('resize', collapseCards);

  btn.addEventListener('click', () => {
    grid.querySelectorAll('.location-card.is-collapsed').forEach(c => c.classList.remove('is-collapsed'));
    btn.classList.add('is-expanded');
  });
}

// ── SMOOTH SCROLL for anchor CTAs ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
