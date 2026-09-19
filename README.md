# M·MINE

> A pure front-end private gallery · Memory bank · AI companion space

M·MINE is a single-page application (SPA) that requires no sign-up and works out of the box. There is no complex social graph, no recommendation algorithm—just your own gallery. Upload photos, and your AI friends will like and comment on them just like real friends. All data is stored locally in your browser by default, keeping everything private and secure.

- **Positioning:** Private space + Memory bank + AI companion
- **Current Version:** v1.4 (with real "burn-after-reading" sharing)
- **Main Site:** GitHub Pages (pure front-end, accessible from mainland China)
- **Sharing Site:** Cloudflare Worker (with backend, used for one-time share links)

---

## ✨ Core Features

- **Private Gallery:** Grid layout, supports 1/2/3 columns, and 3:4 / 1:1 aspect ratios.
- **AI Friends System:** Customize avatars, nicknames, and traits (cold, gentle, talkative, sharp-tongued, etc.). AI friends write comments based on photos or captions.
- **Local-First (Single Device):** Photos and drafts are stored locally in the browser (IndexedDB + localStorage). No registration, no download. **Note: Data is saved only in the current browser on this device.**
- **Themes:** Classic Minimalist, Pixel Retro, Magazine, and Stardew Valley (SPECIAL) styles, with multiple color themes built-in.
- **Auxiliary Features:** Location tagging (OpenStreetMap reverse geocoding), Music player embedding (NetEase / Spotify), Draft box, Data import/export.
- **Burn-After-Reading Sharing** (new): On the Cloudflare Worker version, clicking "Share Profile" generates a one-time link. The link becomes invalid immediately after the recipient opens it once. Shared data is temporarily stored in Cloudflare KV and expires automatically after 24 hours.

---

## 🔀 Dual-Mode Auto Detection

The project automatically switches modes based on the access domain:

| Access URL | Mode | Share Button | Description |
|------------|------|--------------|-------------|
| `chen-yint.github.io/M-MINE` | GitHub Pages (pure front-end) | ❌ Hidden | Accessible from mainland China, daily use |
| `m-mine.cherry-woo0506.workers.dev` | Cloudflare Worker (with backend) | ✅ Visible | For testing / overseas sharing; requires a custom domain for mainland China access |

> **Important:** Cloudflare's free subdomain `*.workers.dev` is blocked in mainland China. If you need mainland users to open share links, you must bind a custom domain (such as `.xyz` / `.top`, about $1–2/year) to the Worker.

---

## 📝 Important Notice

**Two Modes for AI Comments:**
- **Default Mode (No Key):** Uses a built-in local template pool + personality tone variants to simulate AI comments. It works offline and is free, but content can be repetitive. It is a "concept demo".
- **Advanced Mode (BYOK):** Fill in your own API Key (supports DeepSeek, OpenAI, and other compatible APIs) in "Edit Profile → AI Comment Settings" to enable real LLM comments based on photos/captions. **Note: If "Let AI read photos" is enabled, images will be sent to the corresponding third-party model server.**

**Sharing Functionality:**
- The GitHub Pages version has no backend, so the share button is hidden.
- The Cloudflare Worker version has full sharing capabilities and generates true "burn-after-reading" links.
- Shared data is temporarily stored in Cloudflare KV, expires after 24 hours by default, and is deleted immediately when opened (burn-after-reading).
- Due to mainland China network restrictions, the `workers.dev` domain is not directly accessible; a custom domain is required.

**Data Isolation (Lost on Device/Cache Change):**
As a pure front-end app with no account system or cloud sync, all data (photos, drafts, AI friend settings) is stored only in the current browser on this device. Switching devices, using a different browser, or clearing browser data will make previous data inaccessible. **It is highly recommended to regularly click "Edit Profile → Export Backup" and save the JSON file to your cloud drive.**

---

## 🛠️ Tech Stack & Project Structure

- **Front-end:** Vanilla HTML5 / CSS3 / JavaScript (ES6+), no framework dependencies.
- **Data Layer:** IndexedDB + localStorage.
- **Image Processing:** Client-side Canvas compression (max dimension 1000px, JPEG quality 0.7) before saving to IndexedDB.
- **Sharing Backend:** Cloudflare Worker + KV storage (optional, for burn-after-reading sharing).

```text
63  ├── index.html          # Main page
64  ├── app.js              # Front-end logic
65  ├── api/
66  │   └── share.js        # Cloudflare Worker entry (handles sharing API)
67  ├── wrangler.jsonc      # Cloudflare Worker configuration (optional)
68  └── assets/             # Fonts, images, and other static assets
69  ```

---

## 🚀 Local Run & Deployment

### Local Preview
Open `index.html` directly in your browser. Using the VS Code Live Server extension is recommended.

### Deploy to GitHub Pages (Main Site)
The project is configured for GitHub Pages. It automatically deploys upon pushing to the `main` branch. Visit `https://chen-yint.github.io/M-MINE/` to access it.

### Deploy to Cloudflare Worker (Sharing Site, Optional)
1. Create a Worker on Cloudflare and connect your GitHub repository.
2. Create a KV namespace and configure its ID in `wrangler.jsonc` (refer to the project configuration).
3. After deployment, the Worker will provide the `/api/share` endpoint and automatically host the front-end static files.
4. (Optional) Bind a custom domain to the Worker for mainland China access.
   > **🌐 Network Note (Mainland China):** Cloudflare's free subdomain `*.workers.dev` is blocked in mainland China. If you want share links to be accessible from mainland China, you must bind a custom domain (e.g., `.xyz` / `.top`, about $1–2/year) to your Cloudflare Worker.
---

## 🗺️ Roadmap

- [x] **P0:** Implement real sharing functionality (burn-after-reading links).
- [x] **P0:** Dual-mode auto detection (GitHub Pages / Cloudflare Worker).
- [ ] **P1:** Optimize AI comment quality and stability (multimodal LLM backend proxy).
- [ ] **P1:** Implement "optional cloud sync" and account system using Supabase.
- [ ] **P2:** Add formal Privacy Policy and Terms of Service, especially regarding AI image reading.
- [ ] **P2:** Improve testing, explore content marketing on Xiaohongshu/Jike, and lightweight monetization.

---

## 📄 License

Personal project, no open-source license specified yet. Please do not use for commercial purposes.

---

*M·MINE — Record every moment that belongs to you.*
