# GoHighLevel Setup Guide — WingSnob Playoff 2026

## Step 1 — GHL Account (5 min)
1. Go to gohighlevel.com → Start 14-day free trial ($97/mo after)
2. Create sub-account: "Wing Snob Edmonton"
3. Connect sending domain for email (Settings → Email Services → Mailgun recommended)

---

## Step 2 — Custom Fields (5 min)
Settings → Custom Fields → Add Field:

| Field Name | Type |
|------------|------|
| preferred_location | Dropdown: Brewery District, Eversquare, Northgate, Meadows, Manning, Albany, Rabbit Hill, Hamptons, Sherwood Park, Leduc, Calgary Legacy |
| campaign_source | Single Line Text |
| campaign_name | Single Line Text |
| contest_entry | Checkbox |
| code_redeemed | Checkbox |
| ticket_winner | Checkbox |

---

## Step 3 — Pipeline (3 min)
Pipelines → Add Pipeline → Name: "Playoff 2026"

Stages:
1. New Entry
2. Email Sent
3. Engaged (opened/clicked)
4. Code Redeemed
5. Ticket Winner

---

## Step 4 — Inbound Webhook (5 min)
Automations → Create Workflow → Trigger: Inbound Webhook

1. Click "Save Trigger" — GHL generates a webhook URL
2. Copy that URL
3. Open `js/config.js` in the landing page folder
4. Paste it: `GHL_WEBHOOK_URL: 'https://services.leadconnectorhq.com/hooks/YOUR_ID'`

**Payload the webhook receives:**
```json
{
  "first_name": "Courtney",
  "email": "courtney@example.com",
  "phone": "+17801234567",
  "preferred_location": "Edmonton - Brewery District",
  "campaign": "playoff-2026",
  "source": "qr",
  "utm_source": "instagram",
  "utm_medium": "paid",
  "utm_campaign": "playoff-2026",
  "utm_content": ""
}
```

**Webhook Automation Flow:**
```
Trigger: Inbound Webhook
  → Create/Update Contact
  → Set custom field: campaign_name = playoff-2026
  → Set custom field: campaign_source = {{source}}
  → Set custom field: preferred_location = {{preferred_location}}
  → Set custom field: contest_entry = true
  → Add to Pipeline "Playoff 2026" → Stage: New Entry
  → Add Tags (see tags below)
  → Send Email: "Playoff Welcome" (Email 1)
  → IF phone provided: Send SMS 1
  → Wait 48h → IF Email 1 not opened: Send Email 2
  → Move Pipeline Stage → Engaged
```

---

## Step 5 — Tags (auto-applied via workflow)

| Tag | Condition |
|-----|-----------|
| `playoff-2026` | All signups |
| `contest-entrant` | All signups |
| `location-brewery-district` | preferred_location = Brewery District |
| `location-manning` | preferred_location = Manning |
| `location-meadows` | preferred_location = Meadows |
| `location-northgate` | preferred_location = Northgate |
| `location-eversquare` | preferred_location = Eversquare |
| `location-albany` | preferred_location = Albany |
| `location-rabbit-hill` | preferred_location = Rabbit Hill |
| `location-hamptons` | preferred_location = Hamptons |
| `location-sherwood-park` | preferred_location = Sherwood Park |
| `location-leduc` | preferred_location = Leduc |
| `location-calgary-legacy` | preferred_location = Calgary Legacy |
| `source-qr` | source = qr |
| `source-ad` | source = ad |
| `source-social` | source = social |
| `has-phone` | phone is not empty |

---

## Step 6 — Email Sequences

### EMAIL 1 — Instant (triggers on signup)
**Subject:** You're entered. Free wings inside. 🏒
**Preview text:** Your PLAYOFF6 code + your shot at Oilers tickets

---
Hey {{first_name}},

You're in.

**Your contest entry is confirmed.**
You're now in the draw for **1 of 20 pairs** of 2026 Oilers playoff tickets.
Draw happens before the first home playoff game. Winner announced on @wingsnobca.

---

**And your free wings code:**

# PLAYOFF6

Use it on any order of $30+ at your nearest Wing Snob:
📍 {{preferred_location}}

Order at: order.wingsnob.ca

---

How it works:
1. Order online or in-store
2. Mention PLAYOFF6 at pickup (or enter at checkout online)
3. Free 6-piece traditional wings added to your order

Valid all playoff season. One use per customer.

**[ORDER NOW →]** (link: order.wingsnob.ca)

Game on,
Wing Snob Edmonton

---
*No purchase necessary to enter the ticket contest.
Contest open to AB residents 18+. One entry per person.
Full rules: wingsnob.ca/contest*

---

### EMAIL 2 — 48hr Reminder (if Email 1 not clicked)
**Subject:** Your contest entry + free wings code — don't miss it
**Preview text:** PLAYOFF6 expires if you don't use it

---
Hey {{first_name}},

Quick reminder — you entered to win Oilers playoff tickets.

Your free wings code is waiting too:

**PLAYOFF6** — free 6-piece wings on orders $30+

📍 Nearest location: {{preferred_location}}

The Oilers are pushing for the playoffs. Order tonight and your wings are ready in 15 minutes.

**[CLAIM FREE WINGS →]** (link: order.wingsnob.ca)

— Wing Snob

---

### EMAIL 3 — Game Day (send manually on Oilers game days)
**Subject:** Oilers play tonight 🏒 Wings ready in 15 min
**Preview text:** Order now, pick up before puck drop

---
{{first_name}} —

Puck drops at [TIME] tonight.

Your wings can be ready in 15 minutes.

Still have your free wings code?
**PLAYOFF6** — valid on orders $30+ at {{preferred_location}}

**[ORDER YOUR PLAYOFF PACK →]** (link: order.wingsnob.ca)

5 locations across Edmonton. All open till 11 PM (midnight Fri-Sat).

And remember — you're still in the draw for playoff tickets.
20 pairs. One lucky winner could be at the game instead of watching it.

— Wing Snob

---

### EMAIL 4 — Post-Game / 24h After Game Day Email
**Subject:** How were the wings last night? Quick ask 👇
**Preview text:** 30 seconds. Helps us keep serving Edmonton

---
Hey {{first_name}},

Hope the wings hit right last night.

If you loved your order — drop us a Google review.
Takes 30 seconds and helps us keep serving Edmonton.

**[LEAVE A REVIEW →]** (link: Google review for {{preferred_location}})

As a thank you — here's 15% off your next order:
**SNOB15** — valid this week at {{preferred_location}}

— Wing Snob

---

## Step 7 — SMS Sequences (if phone provided)

### SMS 1 — Instant
```
Wing Snob: You're entered to win Oilers playoff tickets! 🏒
Your free wings code: PLAYOFF6
Use on orders $30+ at {{preferred_location}}.
Order: order.wingsnob.ca
Reply STOP to opt out.
```

### SMS 2 — Game Day (send manually 3h before puck drop)
```
Wing Snob: Oilers play tonight at [TIME] 🏒
Order wings now — ready in 15 min.
PLAYOFF6 = free wings on $30+
order.wingsnob.ca
Reply STOP to opt out.
```

---

## Step 8 — GA4 Setup (10 min)
1. Go to analytics.google.com
2. Admin → Create Property → "WingSnob Playoff 2026"
3. Set up Web Data Stream → enter your Netlify URL
4. Copy the Measurement ID (G-XXXXXXXXXX)
5. Open `js/config.js` → paste: `GA4_ID: 'G-XXXXXXXXXX'`

**Events already tracked automatically:**
- `page_view` — every visit, with source + campaign
- `form_start` — first field focused
- `playoff_signup` — successful form submission (source, location, has_phone)
- `order_click` — every Order button (with button_location)
- `faq_expand` — FAQ accordion opens

---

## Go-Live Checklist

- [ ] GHL account created
- [ ] Custom fields added
- [ ] Pipeline created
- [ ] Webhook URL copied into `js/config.js`
- [ ] Webhook automation workflow built
- [ ] Email 1 built and tested (send to yourself)
- [ ] Email 2 built (48hr delay, condition: Email 1 not clicked)
- [ ] SMS 1 built (condition: phone field not empty)
- [ ] GA4 Measurement ID copied into `js/config.js`
- [ ] Deployed to Netlify
- [ ] End-to-end test: submit form → check GHL contact → check inbox
- [ ] QR codes generated with ?source=qr&location=brewery-district etc.
