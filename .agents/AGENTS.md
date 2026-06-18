# Results Poster Studio — Agent Rules

## Critical Rules

### 1. ALWAYS Read SKILL.md First
Before making ANY code changes, you MUST read the project skill file:
```
.agents/skills/results-poster-studio/SKILL.md
```
This file contains the complete project architecture, data models, function references, design system, and current task status. **Do NOT proceed without reading it.**

### 2. ALWAYS Update Documentation After Each Task
After completing ANY task (code change, bug fix, feature addition, refactor), you MUST:

1. **Update SKILL.md** — Update the `Status Tracking` section at the bottom:
   - Mark completed tasks with `[x]`
   - Add any new pending tasks discovered during implementation
   - Update `Current Status` field (PLANNING → IN_PROGRESS → TESTING → COMPLETE)
   - Update `Last Updated` date

2. **Update this AGENTS.md** — If the task introduced new rules, conventions, or patterns, document them here.

3. **Update README.md** — If user-facing features changed, update the README to reflect the current state.

> **Failure to update these files is NOT acceptable.** This project is worked on by different models across sessions. Documentation is the ONLY way to preserve context.

### 3. Project Architecture (Do Not Deviate)
This is a **client-side only** single-page application. Rules:
- **No server/backend** — everything runs in the browser
- **No npm/node dependencies** — pure HTML/CSS/JS + CDN libraries only
- **Canvas API** for rendering — do not introduce DOM-to-image or html2canvas
- **JSZip via CDN** for ZIP downloads — do not bundle or install via npm
- **localStorage** for template config persistence only — NOT for storing generated poster images
- **No frameworks** — no React, Vue, Angular. Vanilla JS only.

### 4. Data Model (Fixed Schema)
ALL competition events use the same fields. Do not add dynamic/flexible field structures:
```
Category, Program, 1st Name, 1st Team, 2nd Name, 2nd Team, 3rd Name, 3rd Team
```

### 5. Template System (Single Template)
- ONE template image is uploaded and used for ALL posters
- Text zones are configured ONCE and reused for every result
- Template config = background image (dataURL) + array of zone objects (label, x, y, fontSize, fontFamily, color, bold, italic, align)

### 6. UI/UX Standards
- **Theme**: Dark navy (`#061028`) with blue-violet accent gradients
- **Glassmorphism**: Cards use `backdrop-filter: blur` with subtle borders
- **Typography**: Montserrat for headings, Inter for body
- **Animations**: Smooth transitions (`0.3s cubic-bezier`)
- **Responsive**: Must work on tablet and desktop (mobile is secondary)
- **No placeholder images**: Use the `generate_image` tool if images are needed

### 7. Code Style
- Use `const` for DOM element references, `let` for mutable state
- Event listeners use arrow functions
- Canvas rendering functions are `async` (for image loading)
- All functions have descriptive names matching the reference in SKILL.md
- Keep code readable — avoid extreme minification/one-liners for complex logic
- Preserve all existing comments that are unrelated to changes

### 8. File Ownership
| File | Purpose | When to modify |
|---|---|---|
| `index.html` | Main UI structure | When adding/changing UI sections or views |
| `css/style.css` | All styling | When changing visual appearance |
| `js/app.js` | Core application logic | When changing functionality |
| `js/assets.js` | Embedded asset data | Only if adding new built-in assets |
| `.agents/skills/results-poster-studio/SKILL.md` | Project knowledge base | **AFTER EVERY TASK** |
| `.agents/AGENTS.md` | Agent rules (this file) | When adding new conventions |
| `README.md` | User-facing docs | When features change |

### 9. Testing Checklist
Before marking any feature as complete, verify:
- [ ] Template upload works (PNG/JPG)
- [ ] Text zones are draggable on the template preview
- [ ] Zone config saves to localStorage and reloads on page refresh
- [ ] Manual form accepts input and queues results
- [ ] "Add & Next" clears form and shows queue count
- [ ] Queue items can be edited and removed
- [ ] "Generate All" produces poster images for every queued result
- [ ] Generated posters appear as thumbnails in the gallery
- [ ] Individual poster download works
- [ ] "Download All as ZIP" works
- [ ] No console errors during normal workflow

### 10. Change Log
Track all significant changes here:

| Date | Change | Files Modified |
|---|---|---|
| 2026-06-18 | Project initialized, SKILL.md and AGENTS.md created | `.agents/` |
| | | |
