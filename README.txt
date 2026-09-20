DESIGNFORGE — GitHub Pages version

This version is completely static and works on GitHub Pages.

Upload these three files to your repository:
- index.html
- style.css
- app.js

Then enable:
Settings -> Pages -> Deploy from branch -> main -> / (root)

Open the generated GitHub Pages URL.

Important:
GitHub Pages cannot run the Flask/Python server. The GitHub version therefore
uses browser localStorage for Save/Load. Python/Flask is only needed if you
later want a real backend/database and server-side project storage.
