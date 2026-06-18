Results Poster Studio

Bulk competition result poster generator. Upload one template, enter results, auto-generate 200+ posters.

Project structure:
- index.html              — Main single-page application
- css/style.css           — Dark glassmorphic theme
- js/app.js               — Core engine (template config, form queue, batch render, ZIP export)
- js/assets.js            — Embedded decorative assets
- navbar.html/            — Shared navigation bar fragment
- results/                — Carousel placeholder images
- .agents/AGENTS.md       — Agent rules (context preservation for multi-model workflows)
- .agents/skills/         — Project skill documentation

How to use:
1. Open `index.html` in a browser (or serve with `npx http-server . -p 8080`).
2. Step 1 — Upload a template poster image and configure text zone positions.
3. Step 2 — Enter results one at a time using the form. Click "Add & Next" to queue each result.
4. Step 3 — Click "Generate All" to batch-create posters. Review in the gallery and download as ZIP.

Data fields per result:
- Category (e.g., "Essay Writing")
- Program (e.g., "Senior Division")
- 1st Prize Name + Team
- 2nd Prize Name + Team
- 3rd Prize Name + Team

Tech stack:
- HTML5, CSS3, Vanilla JavaScript
- Canvas API for poster rendering
- JSZip (CDN) for batch ZIP downloads
- localStorage for template config persistence

Notes:
- This is a client-side only tool — no server required.
- Template config is saved in localStorage and persists across sessions.
- Generated poster images are held in memory only (not persisted).
- For agent/AI context: read `.agents/AGENTS.md` and `.agents/skills/results-poster-studio/SKILL.md` before making changes.
