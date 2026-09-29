DesignForge V23.1 — Professional Studio

V23.1 is a stability patch for mobile editing.

Fixes:
- Reliable two-finger pinch zoom and pan on Android/iOS using pointer capture plus a native touch fallback.
- Pinch gesture cancels object drag/resize/rotate safely.
- Text inspector input no longer rebuilds the inspector on every keystroke, so the mobile keyboard stays open while typing.
- Composition/input handling is preserved for mobile keyboards and IME input.
- Viewport resize caused by the virtual keyboard no longer triggers an automatic canvas refit while a text field is focused.
- Touch-action rules are explicit for the canvas and controls.

Files:
index.html
style.css
app.js

Place your own logo.png beside these files.
Deploy all files together to the GitHub Pages root.
