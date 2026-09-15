M-MINE | AI-powered interactive photo album

A judgment-free private space. Upload photos, and AI friends will automatically comment and like.

Latest Features (v1.3)
- Multi-Theme System: Supports Classic Minimal, Pixel Retro, Magazine Editorial, and SPECIAL (Stardew-inspired) styles, with customizable theme palettes.
- AI Interaction: Built-in AI friend system (customizable name, avatar, personality, and tone variants). They generate unique comments based on photo categories and keywords (or a "secret note to friends"). Supports replying to AI comments.
- AI Comment Controls: Add a "secret note to friends" to guide comment topics, or turn off AI comments entirely when publishing.
- Music Player: Integrated NetEase Cloud Music and Spotify players in the profile. Supports tracks, playlists, and albums.
- Location Support: Manually add a location or use geolocation. Resolved via OpenStreetMap Nominatim and displayed on the work detail page.
- Performance & Storage: Uses IndexedDB for large data (works, drafts) with automatic migration from localStorage. Images are compressed via Canvas (max 1000px, JPEG quality 0.7) before saving.
- Enhanced Detail Page: Comments are collapsed by default and expand on click. Optimized desktop two-column layout ensures images are fully displayed without cropping.
<img width="680" height="360" alt="ezgif com-resize" src="https://github.com/user-attachments/assets/e174d947-75fb-48e3-ab47-4ced9a78e11e" />

Tech Stack
- Vanilla HTML / CSS / JavaScript
- Local Data Storage (IndexedDB + localStorage migration)
- Canvas-based image compression
- Deployed via GitHub Pages

Roadmap
- Integrate Supabase for cloud data synchronization
- Integrate Multimodal AI for smarter, real AI interactions
- Support more dynamic theme effects
- Add real AI comment API as an optional backend

