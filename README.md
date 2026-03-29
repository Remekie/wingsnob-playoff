# WingSnob Playoff Mode — Landing Page

## Deploy to Netlify (5 min)

1. Push this folder to a GitHub repo
2. Go to netlify.com → **Add new site → Import an existing project**
3. Connect your GitHub repo → select this folder as root
4. Click **Deploy site**
5. Netlify auto-deploys on every push

Or drag-and-drop the folder at **app.netlify.com/drop** for instant preview.

---

## Before Going Live — Checklist

### 1. Connect GoHighLevel Webhook
In `js/main.js`, replace:
```js
const GHL_WEBHOOK_URL = 'YOUR_GHL_WEBHOOK_URL';
```
With your actual GHL inbound webhook URL:
```
https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID
```

### 2. Add GA4 Measurement ID
In `index.html`, replace both instances of `G-XXXXXXXXXX` with your GA4 Measurement ID.

### 3. Update Order URL
If WingSnob uses a specific order link per location, update:
```js
const ORDER_URL = 'https://order.wingsnob.ca';
```

### 4. Update Location Addresses
Fill in exact addresses for Meadows, Rabbit Hill, and Sherwood Park in `index.html` (search for `<!-- Meadows -->` etc).

### 5. Custom Domain
In Netlify → Domain settings → Add custom domain → `wingsnob.ca/playoffs` or `playoffs.wingsnob.ca`

---

## QR Code UTM URLs

| Placement | URL |
|-----------|-----|
| In-store (Brewery District) | `/playoffs?source=qr&location=brewery-district` |
| In-store (Manning) | `/playoffs?source=qr&location=manning` |
| Takeout bag insert | `/playoffs?source=qr&location=takeout` |
| Instagram bio | `/playoffs?utm_source=instagram&utm_medium=social&utm_campaign=playoff-2026` |
| Facebook/Meta ad | `/playoffs?utm_source=facebook&utm_medium=paid&utm_campaign=playoff-2026` |

---

## Files

```
wingsnob-playoff/
├── index.html       ← Landing page (all 8 sections)
├── css/
│   └── style.css    ← All styles, mobile-first, dark brutalism
├── js/
│   └── main.js      ← Form, GA4, localStorage, URL params, FAQ
└── README.md        ← This file
```

---

## Tech Notes

- Zero frameworks, zero build step
- Google Fonts loaded: Special Elite + Poppins
- Form posts JSON to GHL webhook via `fetch()`
- `localStorage` key: `wingsnob_playoff_signup` — shows "Welcome Back" on revisit
- GA4 events tracked: `page_view`, `form_start`, `playoff_signup`, `order_click`, `faq_expand`
- CASL compliant: phone field optional, opt-out notice included
