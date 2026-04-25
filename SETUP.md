# 💊 Med Tracker — Setup Guide (PWA on GitHub Pages)

## Overview

```
Your phone (GitHub Pages PWA)
        ↕ fetch() with auth key
Google Apps Script ↔ Google Sheet
```

All data stays in **your** Google Sheet. The PWA is hosted for free on GitHub Pages and installs properly on Android and iPhone home screens.

---

## Step 1 — Set up the Google Sheet & Apps Script

1. Open (or create) your Google Sheet
2. Click **Extensions → Apps Script**
3. Delete all existing code, paste in `Code.gs`, click **Save**
4. In the toolbar, select the function **`setupAuth`** from the dropdown and click **▶ Run**
5. Click **Execution log** — copy the 16-character key it shows, e.g. `A1B2C3D4E5F6G7H8`
6. Deploy → **New Deployment** → Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the **Web App URL**

---

## Step 2 — Publish the PWA to GitHub Pages

1. Go to **[github.com](https://github.com)** → sign in (or create a free account)
2. Click **+** → **New repository**
   - Name: `med-tracker` (or anything you like)
   - Visibility: **Private** ✅ (keeps your app URL unlisted)
   - Click **Create repository**
3. Upload all four files from this folder:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.svg`
   - `icon-512.svg`
   
   You can drag & drop them onto the GitHub repo page and click **Commit changes**.
4. Go to **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / `/ (root)`
   - Click **Save**
5. After ~60 seconds your app is live at:
   `https://YOUR-USERNAME.github.io/med-tracker/`

---

## Step 3 — First launch & connect

1. Open the GitHub Pages URL in **Chrome** on Android or **Safari** on iPhone
2. You'll see a setup screen — enter:
   - **Apps Script URL** (from Step 1, Step 6)
   - **Auth Key** (the 16-char key from Step 1, Step 4)
3. Tap **Connect** — it verifies the key against the sheet live
4. Install to home screen:

   **Android Chrome:** tap ⋮ menu → **"Add to Home screen"** → Chrome will show an install banner
   
   **iPhone Safari:** tap Share button → **"Add to Home Screen"**

---

## Step 4 — Share with your wife

Send her two things:
1. The **GitHub Pages URL** (e.g. `https://you.github.io/med-tracker/`)
2. The **Auth Key**

She opens the URL, enters both, taps Connect — done. She'll also be prompted to install it.

If you ever need to change the auth key, run `setupAuth()` again in Apps Script and share the new key.

---

## Updating the app

To push changes to the PWA:
1. Edit the files and re-upload to GitHub (or use the GitHub web editor)
2. GitHub Pages auto-deploys within ~60 seconds

To update the Apps Script backend:
1. Edit `Code.gs` in the Apps Script editor
2. Deploy → Manage Deployments → Edit → **New version** → Deploy

---

## Security model

- The Apps Script URL is public, but **every request requires the auth key**
- Without the key, `getHistory`, `logDose`, `updateDoseTime`, and `deleteDose` all return `{"error":"Unauthorized"}`
- The key is stored in each phone's `localStorage` — it never travels in a URL parameter for write operations (POST body only)
- The GitHub repo can be **private**, keeping the app URL unlisted

> ⚠️ Always follow your doctor's or pharmacist's dosing advice. Dosing rules in this app are general guidelines only.
