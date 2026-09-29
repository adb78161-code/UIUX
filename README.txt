DesignForge V20 — Responsive Studio

Files for GitHub Pages:
- index.html
- style.css
- app.js

Add your own logo.png beside these files if you want the project logo.

V20 focus:
- Phone/tablet/PC layout rebuilt to prevent desktop UI overflow on small screens.
- Mobile editor uses a centered, auto-fit canvas instead of a desktop-width canvas layout.
- Library and Inspector work as slide-in panels on phone/tablet.
- Inspector uses slider controls for position, size, rotation, radius, opacity, blur, border and typography.
- Two-finger pinch zoom is implemented with Pointer Events and does not save on every frame.
- Touch mode has larger resize/rotation handles.
- New Stickers panel with scrapbook paper, washi tape, paper labels, torn paper, polaroid frame, star, sparkles, heart and flower stickers.
- Sticker artwork is self-contained SVG/data so no external image service is required.
- Existing DesignForge editing, layers, pages, templates, export, image upload, prototype and autosave features retained.

Deployment:
1. Extract this ZIP.
2. Upload index.html, style.css and app.js to the GitHub Pages root.
3. Add your own logo.png in the same folder.
4. Replace the previous DesignForge files completely; do not mix versions.

Validation:
- app.js passed Node.js syntax validation.
- Package structure was checked after build.
- Chromium headless rendering was attempted in the build environment but could not complete reliably, so final touch/visual verification should be done in Chrome on the target phone/tablet and on a PC browser.
