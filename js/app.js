document.addEventListener('DOMContentLoaded', () => {

    // --- State ---
    let templateImage = null; // HTMLImageElement
    let defaultTemplateConfig = {
        bgSrc: null,
        width: 1080,
        height: 1080,
        zones: [
            { id: 'category', label: 'Category', text: 'Essay Writing', x: 260, y: 320, fontSize: 42, fontFamily: 'Poppins', color: '#333333', bold: true, italic: false, align: 'left' },
            { id: 'program', label: 'Program', text: 'Senior Division', x: 260, y: 380, fontSize: 32, fontFamily: 'Inter', color: '#689d62', bold: false, italic: false, align: 'left' },
            { id: 'first_name', label: '1st Name', text: 'John Doe', x: 260, y: 475, fontSize: 46, fontFamily: 'Playfair Display', color: '#333333', bold: true, italic: false, align: 'left' },
            { id: 'first_team', label: '1st Team', text: 'Blue House', x: 800, y: 475, fontSize: 30, fontFamily: 'Inter', color: '#777777', bold: false, italic: false, align: 'right' },
            { id: 'second_name', label: '2nd Name', text: 'Jane Smith', x: 260, y: 585, fontSize: 42, fontFamily: 'Playfair Display', color: '#333333', bold: true, italic: false, align: 'left' },
            { id: 'second_team', label: '2nd Team', text: 'Red House', x: 800, y: 585, fontSize: 26, fontFamily: 'Inter', color: '#777777', bold: false, italic: false, align: 'right' },
            { id: 'third_name', label: '3rd Name', text: 'Sam Wilson', x: 260, y: 690, fontSize: 42, fontFamily: 'Playfair Display', color: '#333333', bold: true, italic: false, align: 'left' },
            { id: 'third_team', label: '3rd Team', text: 'Green House', x: 800, y: 690, fontSize: 26, fontFamily: 'Inter', color: '#777777', bold: false, italic: false, align: 'right' }
        ]
    };
    let templateConfig = JSON.parse(JSON.stringify(defaultTemplateConfig));

    let resultsQueue = []; // array of result objects
    let generatedPosters = []; // array of { result, dataURL }

    // --- DOM Elements ---
    // Navigation
    const stepNavs = document.querySelectorAll('.step-nav');
    const stepContents = document.querySelectorAll('.step-content');

    // Step 1: Template
    const uploadTemplateBtn = document.getElementById('uploadTemplateBtn');
    const resetLayoutBtn = document.getElementById('resetLayoutBtn');
    const templateFileInput = document.getElementById('templateFileInput');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const templateEditorArea = document.getElementById('templateEditorArea');
    const canvas = document.getElementById('templateCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    
    const zoneButtonGrid = document.getElementById('zoneButtonGrid');
    const zoneFontFamily = document.getElementById('zoneFontFamily');
    const zoneFontSize = document.getElementById('zoneFontSize');
    const zoneColor = document.getElementById('zoneColor');
    const zoneAlign = document.getElementById('zoneAlign');
    const zoneBoldBtn = document.getElementById('zoneBoldBtn');
    const zoneItalicBtn = document.getElementById('zoneItalicBtn');
    const showGridToggle = document.getElementById('showGridToggle');
    const zoneX = document.getElementById('zoneX');
    const zoneY = document.getElementById('zoneY');
    const zoneVisibleToggle = document.getElementById('zoneVisibleToggle');

    // Step 2: Form
    const resCategory = document.getElementById('resCategory');
    const resProgram = document.getElementById('resProgram');
    const resFirst = document.getElementById('resFirst');
    const resFirstTeam = document.getElementById('resFirstTeam');
    const resSecond = document.getElementById('resSecond');
    const resSecondTeam = document.getElementById('resSecondTeam');
    const resThird = document.getElementById('resThird');
    const resThirdTeam = document.getElementById('resThirdTeam');
    const addResultBtn = document.getElementById('addResultBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    
    // Trigger preview redraw on input
    [resCategory, resProgram, resFirst, resFirstTeam, resSecond, resSecondTeam, resThird, resThirdTeam].forEach(el => {
        if(el) el.addEventListener('input', renderTemplatePreview);
    });

    const queueList = document.getElementById('queueList');
    const queueCount = document.getElementById('queueCount');
    const generateAllBtn = document.getElementById('generateAllBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    const uploadCsvBtn = document.getElementById('uploadCsvBtn');
    const alignLeftEdgeBtn = document.getElementById('alignLeftEdgeBtn');
    const alignCenterBtn = document.getElementById('alignCenterBtn');
    const alignRightEdgeBtn = document.getElementById('alignRightEdgeBtn');

    // Step 3: Gallery
    const galleryGrid = document.getElementById('galleryGrid');
    const downloadZipBtn = document.getElementById('downloadZipBtn');
    const clearGalleryBtn = document.getElementById('clearGalleryBtn');
    const progressArea = document.getElementById('progressArea');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const offscreenTemplateImg = document.getElementById('offscreenTemplateImg');

    // --- Navigation Logic ---
    stepNavs.forEach(nav => {
        nav.addEventListener('click', () => {
            stepNavs.forEach(n => n.classList.remove('active'));
            stepContents.forEach(c => c.classList.remove('active'));
            nav.classList.add('active');
            document.getElementById(`step${nav.dataset.step}`).classList.add('active');
            
            if (nav.dataset.step === '1') renderTemplatePreview();
        });
    });

    function navigateToStep(stepIndex) {
        document.querySelector(`.step-nav[data-step="${stepIndex}"]`).click();
    }

    // Next Step Buttons
    document.querySelectorAll('.next-step-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.dataset.target || e.target.closest('button').dataset.target;
            if (target) navigateToStep(target);
        });
    });

    // --- Initialization ---
    function init() {
        // Load template config from localStorage
        const savedConfig = localStorage.getItem('template_config');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                templateConfig.bgSrc = parsed.bgSrc || templateConfig.bgSrc;
                templateConfig.width = parsed.width || templateConfig.width;
                templateConfig.height = parsed.height || templateConfig.height;
                // Merge zones so we don't lose any default properties if older config format
                if (parsed.zones && parsed.zones.length > 0) {
                    templateConfig.zones = parsed.zones;
                }

                if (templateConfig.bgSrc) {
                    templateImage = new Image();
                    templateImage.crossOrigin = 'anonymous';
                    templateImage.onload = () => {
                        templateEditorArea.style.display = 'grid';
                        renderTemplatePreview();
                    };
                    templateImage.src = templateConfig.bgSrc;
                    offscreenTemplateImg.src = templateConfig.bgSrc;
                }
            } catch (e) { console.warn("Could not parse saved template config", e); }
        }
        
        populateZoneButtons();
        updateQueueUI();
    }

    // --- Step 1: Template Editor Logic ---
    
    uploadTemplateBtn.addEventListener('click', () => templateFileInput.click());
    
    templateFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            templateConfig.bgSrc = dataUrl;
            
            templateImage = new Image();
            templateImage.crossOrigin = 'anonymous';
            templateImage.onload = () => {
                templateConfig.width = templateImage.width;
                templateConfig.height = templateImage.height;
                templateEditorArea.style.display = 'grid';
                offscreenTemplateImg.src = dataUrl;
                renderTemplatePreview();
                saveTemplate();
            };
            templateImage.src = dataUrl;
        };
        reader.readAsDataURL(file);
    });

    saveTemplateBtn.addEventListener('click', saveTemplate);

    function saveTemplate() {
        if (!templateConfig.bgSrc) return alert("Please upload a template image first.");
        try {
            localStorage.setItem('template_config', JSON.stringify(templateConfig));
            alert('Template configuration saved successfully!');
        } catch (e) {
            alert('Error saving template. Image might be too large for local storage.');
            console.error(e);
        }
    }

    if (resetLayoutBtn) {
        resetLayoutBtn.addEventListener('click', () => {
            if (confirm("Reset layout back to defaults? This will clear your custom text positions.")) {
                const currentBg = templateConfig.bgSrc;
                templateConfig = JSON.parse(JSON.stringify(defaultTemplateConfig));
                templateConfig.bgSrc = currentBg; // preserve background
                localStorage.removeItem('template_config');
                populateZoneButtons();
                renderTemplatePreview();
                alert("Layout reset!");
            }
        });
    }

    function populateZoneButtons() {
        if (!zoneButtonGrid) return;
        zoneButtonGrid.innerHTML = '';
        templateConfig.zones.forEach((z, index) => {
            const btn = document.createElement('button');
            btn.className = 'zone-btn' + (index === activeZoneIndex ? ' active' : '');
            btn.textContent = z.label;
            btn.dataset.index = index;
            btn.addEventListener('click', (e) => {
                activeZoneIndex = parseInt(e.target.dataset.index);
                updateZoneButtonStates();
                loadZoneSettings(activeZoneIndex);
                renderTemplatePreview();
            });
            zoneButtonGrid.appendChild(btn);
        });
        loadZoneSettings(activeZoneIndex);
    }

    let activeZoneIndex = 0;

    function updateZoneButtonStates() {
        if (!zoneButtonGrid) return;
        const btns = zoneButtonGrid.querySelectorAll('.zone-btn');
        btns.forEach(b => {
            const idx = parseInt(b.dataset.index);
            const z = templateConfig.zones[idx];
            if (idx === activeZoneIndex) b.classList.add('active');
            else b.classList.remove('active');
            if (z.visible === false) b.classList.add('hidden-zone');
            else b.classList.remove('hidden-zone');
        });
    }

    function loadZoneSettings(index) {
        const zone = templateConfig.zones[index];
        if (!zone) return;
        zoneFontFamily.value = zone.fontFamily;
        zoneFontSize.value = zone.fontSize;
        zoneColor.value = zone.color;
        zoneAlign.value = zone.align;
        zoneX.value = Math.round(zone.x);
        zoneY.value = Math.round(zone.y);
        zoneVisibleToggle.checked = zone.visible !== false;
        
        zoneBoldBtn.style.background = zone.bold ? 'rgba(255,255,255,0.2)' : '';
        zoneItalicBtn.style.background = zone.italic ? 'rgba(255,255,255,0.2)' : '';
    }

    // Zone Settings Handlers
    zoneFontFamily.addEventListener('change', e => { templateConfig.zones[activeZoneIndex].fontFamily = e.target.value; renderTemplatePreview(); });
    zoneFontSize.addEventListener('input', e => { templateConfig.zones[activeZoneIndex].fontSize = parseInt(e.target.value); renderTemplatePreview(); });
    zoneColor.addEventListener('input', e => { templateConfig.zones[activeZoneIndex].color = e.target.value; renderTemplatePreview(); });
    zoneAlign.addEventListener('change', e => { templateConfig.zones[activeZoneIndex].align = e.target.value; renderTemplatePreview(); });
    zoneBoldBtn.addEventListener('click', () => { 
        const z = templateConfig.zones[activeZoneIndex]; 
        z.bold = !z.bold; 
        loadZoneSettings(activeZoneIndex); 
        renderTemplatePreview(); 
    });
    zoneItalicBtn.addEventListener('click', () => { 
        const z = templateConfig.zones[activeZoneIndex]; 
        z.italic = !z.italic; 
        loadZoneSettings(activeZoneIndex); 
        renderTemplatePreview(); 
    });
    zoneX.addEventListener('input', e => { templateConfig.zones[activeZoneIndex].x = parseInt(e.target.value) || 0; renderTemplatePreview(); });
    zoneY.addEventListener('input', e => { templateConfig.zones[activeZoneIndex].y = parseInt(e.target.value) || 0; renderTemplatePreview(); });
    zoneVisibleToggle.addEventListener('change', e => { 
        templateConfig.zones[activeZoneIndex].visible = e.target.checked; 
        updateZoneButtonStates(); 
        renderTemplatePreview(); 
    });
    if(showGridToggle) showGridToggle.addEventListener('change', renderTemplatePreview);

    if(alignLeftEdgeBtn) alignLeftEdgeBtn.addEventListener('click', () => { templateConfig.zones[activeZoneIndex].align = 'left'; loadZoneSettings(activeZoneIndex); renderTemplatePreview(); });
    if(alignCenterBtn) alignCenterBtn.addEventListener('click', () => { templateConfig.zones[activeZoneIndex].align = 'center'; loadZoneSettings(activeZoneIndex); renderTemplatePreview(); });
    if(alignRightEdgeBtn) alignRightEdgeBtn.addEventListener('click', () => { templateConfig.zones[activeZoneIndex].align = 'right'; loadZoneSettings(activeZoneIndex); renderTemplatePreview(); });

    // Rendering Canvas Preview
    function renderTemplatePreview() {
        if (!ctx || !templateImage) return;
        
        canvas.width = templateConfig.width;
        canvas.height = templateConfig.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

        if (showGridToggle && showGridToggle.checked) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
            for (let i = 0; i < canvas.height; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
            ctx.restore();
        }

        templateConfig.zones.forEach((z, index) => {
            if (z.visible === false) return;
            const font = `${z.bold ? 'bold ' : ''}${z.italic ? 'italic ' : ''}${z.fontSize}px "${z.fontFamily}"`;
            ctx.font = font;
            ctx.fillStyle = z.color;
            ctx.textAlign = z.align;
            ctx.textBaseline = 'middle';
            
            // Get live value from form or fallback to label
            let val = z.label;
            const inputEl = document.getElementById('res' + z.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''));
            // Exception for category/program mapping
            let liveVal = '';
            if (z.id === 'category') liveVal = resCategory.value;
            else if (z.id === 'program') liveVal = resProgram.value;
            else if (z.id === 'first_name') liveVal = resFirst.value;
            else if (z.id === 'first_team') liveVal = resFirstTeam.value;
            else if (z.id === 'second_name') liveVal = resSecond.value;
            else if (z.id === 'second_team') liveVal = resSecondTeam.value;
            else if (z.id === 'third_name') liveVal = resThird.value;
            else if (z.id === 'third_team') liveVal = resThirdTeam.value;
            
            if (liveVal && liveVal.trim() !== '') val = liveVal.trim();
            
            const lines = String(val).split('\n');
            let drawY = z.y;
            
            // Draw text
            lines.forEach(line => {
                ctx.fillText(line.trim(), z.x, drawY);
                drawY += z.fontSize * 1.2;
            });
            
            // Draw highlight box if active
            if (index === activeZoneIndex) {
                const metrics = ctx.measureText(lines[0]);
                const w = metrics.width;
                const h = z.fontSize * 1.2;
                let left = z.x;
                if (z.align === 'center') left = z.x - w/2;
                else if (z.align === 'right') left = z.x - w;
                
                ctx.save();
                ctx.strokeStyle = '#7c3aed';
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 2;
                ctx.strokeRect(left - 5, z.y - h/2 - 5, w + 10, h + 10);
                
                // Draw anchor point (red dot) so user understands alignment
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(z.x, z.y, 5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
        });
    }

    // Canvas Dragging Logic
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Find clicked zone (reverse order for top-most)
        for (let i = templateConfig.zones.length - 1; i >= 0; i--) {
            const z = templateConfig.zones[i];
            ctx.font = `${z.bold ? 'bold ' : ''}${z.italic ? 'italic ' : ''}${z.fontSize}px "${z.fontFamily}"`;
            const metrics = ctx.measureText(z.label);
            const w = metrics.width;
            const h = z.fontSize * 1.2;
            let left = z.x;
            if (z.align === 'center') left = z.x - w/2;
            else if (z.align === 'right') left = z.x - w;

            if (x >= left - 10 && x <= left + w + 10 && y >= z.y - h/2 - 10 && y <= z.y + h/2 + 10) {
                activeZoneIndex = i;
                updateZoneButtonStates();
                loadZoneSettings(i);
                isDragging = true;
                dragOffsetX = x - z.x;
                dragOffsetY = y - z.y;
                renderTemplatePreview();
                break;
            }
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        let newX = x - dragOffsetX;
        let newY = y - dragOffsetY;
        
        // Smart Snapping logic (snap to other zones)
        let snapped = false;
        templateConfig.zones.forEach((z, i) => {
            if (i === activeZoneIndex || z.visible === false) return;
            // Snap X
            if (Math.abs(newX - z.x) < 15) { newX = z.x; snapped = true; }
            // Snap Y
            if (Math.abs(newY - z.y) < 15) { newY = z.y; snapped = true; }
        });
        
        // Absolute center snap
        const centerX = templateConfig.width / 2;
        const centerY = templateConfig.height / 2;
        if (Math.abs(newX - centerX) < 25) newX = centerX;
        if (Math.abs(newY - centerY) < 25) newY = centerY;
        
        templateConfig.zones[activeZoneIndex].x = newX;
        templateConfig.zones[activeZoneIndex].y = newY;
        if(zoneX) zoneX.value = Math.round(templateConfig.zones[activeZoneIndex].x);
        if(zoneY) zoneY.value = Math.round(templateConfig.zones[activeZoneIndex].y);
        renderTemplatePreview();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) saveTemplate();
        isDragging = false;
    });


    // --- Step 2: Form & Queue Logic ---

    function clearForm() {
        resFirst.value = ''; resFirstTeam.value = '';
        resSecond.value = ''; resSecondTeam.value = '';
        resThird.value = ''; resThirdTeam.value = '';
        resFirst.focus();
    }
    
    clearFormBtn.addEventListener('click', clearForm);

    if (uploadCsvBtn) {
        uploadCsvBtn.addEventListener('click', () => csvFileInput.click());
        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target.result;
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                if (lines.length < 2) { alert('CSV needs a header row and at least one data row.'); return; }
                const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
                
                let addedCount = 0;
                for (let i = 1; i < lines.length; i++) {
                    const rowText = lines[i];
                    // Simple split by comma, ignoring commas within quotes
                    const cols = [];
                    let inQuotes = false, curr = '';
                    for(let char of rowText) {
                        if(char === '"') inQuotes = !inQuotes;
                        else if(char === ',' && !inQuotes) { cols.push(curr); curr = ''; }
                        else curr += char;
                    }
                    cols.push(curr);
                    const row = cols.map(c => c.trim());
                    
                    const res = {};
                    const zoneMappingKeys = [
                        { id: 'category', aliases: ['category', 'event'] },
                        { id: 'program', aliases: ['program', 'group', 'section'] },
                        { id: 'first_name', aliases: ['1st', 'first', 'name 1', 'winner'] },
                        { id: 'first_team', aliases: ['1st team', 'first team', 'team 1'] },
                        { id: 'second_name', aliases: ['2nd', 'second', 'name 2', 'runner'] },
                        { id: 'second_team', aliases: ['2nd team', 'second team', 'team 2'] },
                        { id: 'third_name', aliases: ['3rd', 'third', 'name 3'] },
                        { id: 'third_team', aliases: ['3rd team', 'third team', 'team 3'] }
                    ];
                    
                    let mappedCols = new Set();
                    zoneMappingKeys.forEach(zk => {
                        let headerIdx = headers.findIndex(h => zk.aliases.some(a => h.includes(a)));
                        if(headerIdx !== -1 && row[headerIdx]) {
                            res[zk.id] = row[headerIdx];
                            mappedCols.add(headerIdx);
                        }
                    });
                    
                    // Fallback to sequential if few headers matched
                    if (mappedCols.size < 2) {
                        const fallbackKeys = templateConfig.zones.filter(z => z.visible !== false).map(z => z.id);
                        fallbackKeys.forEach((key, idx) => {
                            if (row[idx] && !res[key]) res[key] = row[idx];
                        });
                    }
                    
                    if (Object.keys(res).length > 0) {
                        res.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        resultsQueue.push(res);
                        addedCount++;
                    }
                }
                updateQueueUI();
                alert(`Successfully imported ${addedCount} results from CSV!`);
                csvFileInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    addResultBtn.addEventListener('click', () => {
        const result = {
            id: Date.now().toString(),
            category: resCategory.value.trim(),
            program: resProgram.value.trim(),
            first_name: resFirst.value.trim(),
            first_team: resFirstTeam.value.trim(),
            second_name: resSecond.value.trim(),
            second_team: resSecondTeam.value.trim(),
            third_name: resThird.value.trim(),
            third_team: resThirdTeam.value.trim()
        };
        
        // Simple validation: Ensure at least one field has data
        if (!result.first_name && !result.category && !result.program) {
            return alert("Please enter at least some details.");
        }

        resultsQueue.push(result);
        updateQueueUI();
        clearForm(); // Keep category/program, clear names
    });

    function removeResult(id) {
        resultsQueue = resultsQueue.filter(r => r.id !== id);
        updateQueueUI();
    }

    function updateQueueUI() {
        queueCount.textContent = resultsQueue.length;
        queueList.innerHTML = '';
        
        if (resultsQueue.length === 0) {
            queueList.innerHTML = '<div class="muted" style="padding:20px; text-align:center;">Queue is empty.</div>';
            generateAllBtn.disabled = true;
            return;
        }

        generateAllBtn.disabled = false;
        
        resultsQueue.forEach((res, i) => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            
            let title = res.first_name || 'No Name';
            if (res.category || res.program) title += ` - ${res.category} ${res.program}`;
            
            item.innerHTML = `
                <div>
                    <h4>Event ${i+1}: ${title}</h4>
                    <div class="muted">1st: ${res.first_name||'-'}, 2nd: ${res.second_name||'-'}, 3rd: ${res.third_name||'-'}</div>
                </div>
                <button class="btn ghost small remove-btn" data-id="${res.id}">Remove</button>
            `;
            queueList.appendChild(item);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => removeResult(e.target.dataset.id));
        });
    }


    // --- Step 3: Batch Generation & Gallery Logic ---

    // Renders a single poster offscreen and returns DataURL
    async function renderSinglePosterDataURL(result) {
        await document.fonts.ready; // Ensure custom fonts are fully loaded to fix alignment issues
        const oc = document.createElement('canvas');
        oc.width = templateConfig.width;
        oc.height = templateConfig.height;
        const octx = oc.getContext('2d');
        
        // Draw background
        if (offscreenTemplateImg.src && offscreenTemplateImg.complete) {
            octx.drawImage(offscreenTemplateImg, 0, 0, oc.width, oc.height);
        } else {
            octx.fillStyle = '#ffffff';
            octx.fillRect(0, 0, oc.width, oc.height);
        }

        templateConfig.zones.forEach(z => {
            if (z.visible === false) return;
            const val = result[z.id] || '';
            if (!val) return; // skip if no data

            octx.font = `${z.bold ? 'bold ' : ''}${z.italic ? 'italic ' : ''}${z.fontSize}px "${z.fontFamily}"`;
            octx.fillStyle = z.color;
            octx.textAlign = z.align;
            octx.textBaseline = 'middle';
            
            // basic multi-line handling if needed
            const lines = String(val).split('\n');
            let drawY = z.y;
            // Adjust starting Y if multiple lines to keep it roughly centered, but let's keep it simple
            if (z.align === 'center') {
              // already middle aligned but let's just use default stroke for simplicity
            }
            
            lines.forEach(line => {
                octx.fillText(line, z.x, drawY);
                drawY += z.fontSize * 1.2;
            });
        });

        return oc.toDataURL('image/png');
    }

    generateAllBtn.addEventListener('click', async () => {
        if (!templateConfig.bgSrc) return alert("Please setup the template in Step 1 first.");
        if (resultsQueue.length === 0) return;

        navigateToStep(3);
        
        progressArea.style.display = 'block';
        galleryGrid.innerHTML = '';
        generatedPosters = [];
        downloadZipBtn.disabled = true;

        for (let i = 0; i < resultsQueue.length; i++) {
            const res = resultsQueue[i];
            
            // Update progress
            progressText.textContent = `Generating ${i+1} of ${resultsQueue.length}...`;
            progressFill.style.width = `${((i+1)/resultsQueue.length)*100}%`;
            
            // Render
            const dataUrl = await renderSinglePosterDataURL(res);
            generatedPosters.push({ result: res, dataUrl });
            
            // Append to gallery incrementally
            appendGalleryItem(res, dataUrl, i);

            // Yield to browser UI thread
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        progressText.innerHTML = `Done! Generated ${resultsQueue.length} posters. <button id="inlineDownloadZipBtn" class="btn" style="margin-left: 12px; padding: 6px 12px; font-size: 13px;">Download All as ZIP</button>`;
        
        document.getElementById('inlineDownloadZipBtn').addEventListener('click', () => {
            downloadZipBtn.click();
        });
        downloadZipBtn.disabled = false;
        
        // Clear queue after successful generation
        resultsQueue = [];
        updateQueueUI();
    });

    function appendGalleryItem(res, dataUrl, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const title = `${res.category||'Event'}_${res.program||'Prog'}_${index+1}`.replace(/\s+/g, '_');
        
        item.innerHTML = `
            <img src="${dataUrl}" alt="Poster Preview">
            <div class="gallery-item-footer">
                <span class="title" title="${title}">${title}</span>
                <button class="btn ghost small dl-single" data-idx="${index}">Download Image</button>
            </div>
        `;
        galleryGrid.appendChild(item);

        item.querySelector('.dl-single').addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${title}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    }

    clearGalleryBtn.addEventListener('click', () => {
        if(!confirm("Clear all generated posters?")) return;
        generatedPosters = [];
        galleryGrid.innerHTML = '<div class="muted" style="padding:20px; grid-column:1/-1; text-align:center;">No posters generated yet.</div>';
        progressArea.style.display = 'none';
        downloadZipBtn.disabled = true;
    });

    // JSZip Export
    downloadZipBtn.addEventListener('click', () => {
        if (generatedPosters.length === 0) return;
        if (typeof JSZip === 'undefined') return alert('JSZip library not loaded. Please ensure you have an internet connection.');

        downloadZipBtn.textContent = 'Zipping...';
        downloadZipBtn.disabled = true;

        const zip = new JSZip();
        const folder = zip.folder("Results_Posters");

        generatedPosters.forEach((p, i) => {
            const title = `${p.result.category||'Event'}_${p.result.program||'Prog'}_${i+1}`.replace(/\s+/g, '_');
            const dataIdx = p.dataUrl.indexOf("base64,") + 7;
            const b64Data = p.dataUrl.substring(dataIdx);
            folder.file(`${title}.png`, b64Data, {base64: true});
        });

        zip.generateAsync({type:"blob"}).then(function(content) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = "Results_Posters_Bulk.zip";
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            downloadZipBtn.textContent = 'Download All as ZIP';
            downloadZipBtn.disabled = false;
        });
    });

    // Run init
    init();
});
