# NVN Estate

A Vite + React property browsing app for discovering homes, saving favorites, estimating sell prices, and submitting agent listings.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Optional production build:

```bash
npm run build
npm run preview
```

### Environment

Copy `.env.example` to `.env` if you want custom values:

| Variable | Purpose |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for the Inquire CTA (digits only, with country code) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Optional Clerk key. Leave empty to use demo Buyer / Agent sign-in |

Without a Clerk key, use the **Demo buyer** and **Demo agent** buttons in the header.

---

## Features

### Browse & filter listings
- Property cards show photo, title, price, location, BHK, baths, and sq.ft
- Top search bar filters by location, price range, property type, and bedrooms
- Heart icon saves a home; **Saved** tab on the home page shows favorites quickly

### Map + list sync
- Split view: Leaflet map on the left, listings on the right
- Hover or select a card to highlight its map pin (and the reverse)
- Pins update as filters change

### Property details & WhatsApp inquire
- **View Details** opens a detail panel
- **Inquire on WhatsApp** opens `wa.me` with the listing title, ID, and price prefilled

### Mortgage calculator
- Adjust home price, down payment %, interest rate, and loan term
- See estimated monthly payment split into principal and property taxes
- Jump to it from the header (**Mortgage calc**) or scroll to `#mortgage` on the home page

### Roles: Buyer, Agent / Seller, Admin
| Role | What you can do |
| --- | --- |
| **Buyer** | Save favorites, view history, create filter alerts on **My saved homes** |
| **Agent / Seller** | Submit listings (they stay **pending** until an admin approves) |
| **Admin** | Review every listing on **Admin review**, approve to publish, reject, or delete |

Demo mode signs you in as one role immediately. With Clerk, choose a role after first sign-in.

### My Saved Homes (`/saved`)
Buyer dashboard with three sections:
1. **Favorited listings** — homes you’ve hearted
2. **Saved filter alerts** — snapshot of the current home-page filters (**Save current filters**)
3. **View history** — recent detail views

### Sell Your Home (`/sell`)
Landing page with a step form:
1. Address  
2. Property details (type, sq.ft, beds, baths)  
3. Contact info  
4. Estimate  

After step 3, the lead is stored in the local database and you see a comps-based **estimated price range**.

### Submit listing (`/submit-listing`)
Agent-only multi-step form: details → location → amenities → drag-and-drop photos. On the location step, enter an address, **drop a pin on the map**, review it, then **Confirm location** before continuing. After submit, the listing waits for **admin approval** before it appears on the public grid.

### Admin review (`/admin`)
Admin dashboard with Pending / Approved / Rejected / All tabs. For each listing an admin can **Preview**, **Approve & publish**, **Reject**, or **Delete**.

---

## How to use

### As a visitor (no sign-in)
1. Browse the home page and try location / price / type / bedroom filters.
2. Heart homes to save them on this device.
3. Open **View Details**, then use WhatsApp inquire if you want to message about a listing.
4. Use the mortgage calculator to estimate payments.
5. Open **Sell your home** for a free valuation lead flow.

### As a Buyer
1. Click **Demo buyer** (or sign in with Clerk and pick Buyer).
2. Heart listings from the grid or detail panel.
3. Open a few details so they appear in history.
4. Go to **My saved homes**.
5. Optionally adjust filters on the home page, return to **My saved homes**, and click **Save current filters**.

### As an Agent / Seller
1. Click **Demo agent** (or sign in with Clerk and pick Agent / Seller).
2. Open **Submit listing** from the header.
3. Complete the four steps and submit — the listing is queued as **pending**.
4. You can also use **Sell your home** to capture seller leads with a price estimate.

### As an Admin
1. Click **Demo admin** (or sign in with Clerk and pick Admin).
2. Open **Admin review** from the header.
3. Open **Pending**, check each submission, then **Approve & publish** or **Reject**.
4. Use **Delete** to remove a listing from the catalog entirely.

### Switching roles (demo)
Use **Sign out**, then choose **Demo buyer**, **Demo agent**, or **Demo admin** again.

---

## Data & auth notes

- Favorites, alerts, view history, sell leads, agent listings, and the **listing catalog** (including approval status) are stored in **browser localStorage** (helpers under `src/db/`).
- **Listing photos** are not uploaded to a server. While you pick files they use temporary `blob:` preview URLs in memory; on submit they are converted to **data URLs** (base64) and saved with the listing in memory / localStorage so cards keep showing the image.
- Clearing site data resets demo accounts and saved items.
- Clerk is optional; the app falls back to demo auth when no publishable key is set.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
