DesignForge V12.6 FIXED
==================
Mobile + touch optimization release built on V11.

Highlights:
- Stable touch/mouse drag, resize and rotation interactions.
- Larger touch handles.
- Two-finger pinch-to-zoom.
- Optional canvas pan mode.
- Mobile action bar: Home, Layers, New Layer, Preview, Export.
- Touch Controls menu.
- Autosave every 5 seconds.
- Preserves V11 custom canvas, blur/glass, responsive PC/tablet/phone/custom preview,
  layers, pages, logo, colors, 360 rotation and export.

GitHub Pages:
Upload index.html, style.css, app.js and logo.png together.
Deploy from Branch -> /(root).

No backend is required for this static build.


V12.6 critical fix:
- Restored missing modal, zoom, device, inspector, duplicate and delete functions.
- Added a complete working inspector for position, size, rotation, colors, opacity, blur,
  background blur, radius, shadow and text controls.
- Uses a fresh V12.6 localStorage key to prevent broken V11/V12.5 state from loading.
