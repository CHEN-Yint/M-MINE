M·MINE
> A local-first interactive album experiment.  
> v1.3 “AI friends” are local template simulations, not a real LLM.  
> Data stays in your browser by default; photos do not leave your device.

Status
- v1.3, pure front-end, no backend, GitHub Pages
- Positioning: local AI-simulated album / proof of concept

What Works
- Upload up to 9 images, Canvas compression, 3:4 / 1:1 ratios
- Gallery: 1 / 2 / 3 columns, collect filter, detail page
- Likes, collect, comments, replies, drafts
- Local AI friends: 6 defaults, editable, traits, local template comments
- Music: NetEase / Spotify iframe
- Location: Geolocation + OpenStreetMap Nominatim
- Themes: Classic / Pixel / Magazine / Special (Stardew tribute)
- Storage: IndexedDB + localStorage, import/export JSON, reset

Not Implemented / Limits
- No real AI: comments are local templates + keyword matching + random
- No 30-minute freeze
- No full “judgment-free”: like counts are still visible
- No account system, no cloud sync
- No privacy policy / terms yet
- Weak engineering: legacy files may exist, no tests

Privacy
- Photos and data stay local by default
- Location sends coordinates to OpenStreetMap Nominatim
- Music embeds third-party iframes
- Future real AI / cloud sync will update this notice

Roadmap
- P0: honest labeling, privacy notice
- P1: real multimodal LLM via backend proxy, optional Supabase cloud sync, real 30-minute freeze
- P2: clean repo, tests, growth, light monetization

Credits
Stardew Valley theme is a fan tribute, not affiliated with ConcernedApe LLC.  
Stardew Valley © ConcernedApe.

Disclaimer
v1.3 is a local simulation.  
Roadmap items are not implemented yet.
