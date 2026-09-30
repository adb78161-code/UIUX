DesignForge V27 — Offline Studio

Files:
- index.html
- style.css
- app.js
- manifest.webmanifest
- sw.js
- icon.svg
- README.txt

Offline use:
1. For GitHub Pages / HTTPS: upload the whole folder. Open the site once while online; the service worker caches the editor shell. Then it can open as an installed PWA and continue working offline.
2. Android Chrome: open the site online, choose Install app / Add to Home screen. Launch DesignForge from the installed app.
3. Windows Chrome/Edge: open the site and use the browser Install button when available.
4. Direct file opening (file://): the editor UI can still open from the folder, but browsers do not allow service-worker PWA installation from file://. Use a local static server if you want installable offline PWA behavior.

Projects are stored locally by the editor. Keep project exports/backups for important work because clearing site data can remove local projects.

Your own logo.png can be placed beside the files. It is intentionally not included.
