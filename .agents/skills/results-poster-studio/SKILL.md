---
name: results-poster-studio
description: >
  Bulk competition result poster generator. Upload ONE template image, configure text zones,
  then add results via manual form (Category, Program, 1st/2nd/3rd Name+Team). Auto-generates
  posters using the template and displays them in a Verified Results gallery for review and
  batch download as ZIP. Client-side only (HTML/CSS/JS + Canvas API + JSZip).
---

# Results Poster Studio — Project Skill

## Project Overview

A client-side web tool for generating competition result posters at scale.
One template image is uploaded and configured with text zones (positions for Category, Program,
1st/2nd/3rd place names and teams). Results are entered via a manual form with an "Add Another"
queue system. The tool auto-generates a poster for each result entry using the HTML5 Canvas API,
then displays all generated posters in a gallery. Users can download all posters as a ZIP file
using JSZip.

## Architecture

```
results-poster-studio/
├── index.html              # Main SPA — 3-step pipeline UI
├── css/
│   └── style.css           # Dark glassmorphic theme, gallery grid, zone editor styles
├── js/
│   ├── app.js              # Core engine: template config, form queue, batch render, ZIP export
│   └── assets.js           # Embedded assets (Kerala-themed elements)
├── navbar.html/
│   ├── navbar.html          # Shared nav fragment
│   └── Untitled-2.png       # Logo
├── results/
│   ├── img1.svg, img2.svg, img3.svg  # Carousel placeholder images
├── .agents/
│   ├── AGENTS.md            # Project rules and context preservation
│   └── skills/
│       └── results-poster-studio/
│           └── SKILL.md     # This file
└── README.md
```

## Core Concepts

### 1. Template System
- User uploads ONE background image (PNG/JPG)
- Text zones are configured via drag-and-drop on a canvas preview
- Each zone has: label, x, y, fontSize, fontFamily, color, bold, italic, align
- Default zones: Category, Program, 1st Name, 1st Team, 2nd Name, 2nd Team, 3rd Name, 3rd Team
- Template config (image as dataURL + zone positions) is saved to `localStorage` key: `template_config`

### 2. Results Data Model
Each result entry has these fields (ALL events use the same structure):
```json
{
  "id": "unique-id",
  "category": "Essay Writing",
  "program": "Senior Division",
  "firstName": "Ahmad K",
  "firstTeam": "Blue House",
  "secondName": "Sara M",
  "secondTeam": "Red House",
  "thirdName": "John D",
  "thirdTeam": "Green House",
  "generated": false,
  "posterDataURL": null
}
```

### 3. Results Queue
- Manual form with "Add & Next" button to queue multiple results
- Results stored in memory array `resultsQueue[]`
- Queue is displayed as a scrollable list showing count and category names
- "Generate All" button processes the entire queue

### 4. Batch Rendering Pipeline
```
For each result in resultsQueue:
  1. Create offscreen canvas (template dimensions)
  2. Draw template background image
  3. For each text zone in template config:
     - Map zone label → result field value
     - Draw text at configured position with configured style
  4. Export canvas as PNG dataURL
  5. Store in result.posterDataURL
```

### 5. Verified Results Gallery
- Grid of thumbnail previews (all generated posters)
- Click to enlarge/preview
- "Download All as ZIP" button using JSZip
- "Download Individual" button per poster
- "Clear All" to reset

### 6. ZIP Export
- Uses JSZip library (loaded via CDN: `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`)
- Filename format: `{Category}_{Program}_{index}.png`
- Triggers browser download of the ZIP file

## Tech Stack
- **HTML5** — Structure and semantic markup
- **CSS3** — Dark theme, glassmorphism, animations, responsive grid
- **Vanilla JavaScript** — No frameworks, pure DOM manipulation
- **Canvas API** — Poster rendering (both on-screen preview and offscreen batch)
- **JSZip** — Client-side ZIP file generation
- **localStorage** — Template config persistence (NOT poster images — too large)
- **Google Fonts** — Inter (body), Montserrat (headings)

## Key Functions Reference

| Function | Purpose |
|---|---|
| `saveTemplateConfig()` | Saves template image + zone positions to localStorage |
| `loadTemplateConfig()` | Loads saved template config on page load |
| `addResultToQueue(data)` | Pushes a result entry to the queue array |
| `removeFromQueue(index)` | Removes a result entry from the queue |
| `generateAllPosters()` | Batch renders all queued results into poster dataURLs |
| `renderSinglePoster(result, config)` | Renders one poster on offscreen canvas, returns dataURL |
| `displayGallery(results)` | Renders thumbnail grid in Verified Results section |
| `downloadAllAsZip(results)` | Creates ZIP of all poster PNGs and triggers download |
| `downloadSinglePoster(result)` | Downloads one poster as PNG |

## UI Flow (3 Steps)

### Step 1: Template Setup
- Upload template image button
- Canvas preview showing template with draggable text zone indicators
- Each zone shown as a labeled rectangle that can be dragged/repositioned
- Font/size/color controls per zone
- "Save Template" button to persist config

### Step 2: Add Results
- Manual form with fields: Category, Program, 1st/2nd/3rd Name+Team
- "Add & Next" button — saves current entry to queue and clears form
- Queue list displayed beside form (scrollable, shows count)
- "Edit" and "Remove" buttons per queue item
- "Generate All Posters" button when queue is ready

### Step 3: Verified Results (Gallery)
- Grid of generated poster thumbnails
- Click thumbnail to see full-size preview
- "Download All as ZIP" button
- "Download" button per poster
- "Clear All" button
- Count indicator (e.g., "48 of 200 posters generated")

## Design System
- **Background**: `#061028` (deep navy)
- **Surface**: `rgba(255,255,255,0.03)` with `backdrop-filter: blur`
- **Accent**: `#3b82f6` (blue) → `#7c3aed` (violet) gradient
- **Text**: `#e6eef8` (light)
- **Muted**: `#9fb0c9`
- **Cards**: Glassmorphic with subtle borders and deep shadows
- **Animations**: `transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)`

## Status Tracking

> This section MUST be updated after every task completion.

### Current Status: `COMPLETE`
### Last Updated: 2026-06-18
### Completed Tasks:
- [x] Project analysis
- [x] Architecture proposal
- [x] SKILL.md created
- [x] AGENTS.md created
- [x] Rewrite `index.html` with 3-step pipeline UI
- [x] Rewrite `css/style.css` matching dark glassmorphism theme
- [x] Rewrite `js/app.js` with array iteration and new config
- [x] Fix Canvas API string parsing for fonts with spaces
- [x] Enhance Gallery download UI (Max-width, clear Download buttons, inline ZIP)
- [x] Pro Dashboard (Alignment grid, X/Y inputs, Visibility toggles)
- [x] Alignment Fixes (Center snapping, Quick align buttons, `document.fonts.ready`)
- [x] Bulk CSV Upload (Parse CSV to queue 200+ results instantly)
- [x] Test manual form queue (add/edit/remove)
- [x] Test batch poster generation
- [x] Test ZIP download
- [x] Test gallery display and individual downloads
- [x] Final polish and responsive testing
- [x] Added guided wizard flow "Continue" buttons
- [x] Enhanced hover effects, form states, and micro-interactions

### Pending Tasks:
- None
