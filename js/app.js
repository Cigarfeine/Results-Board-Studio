document.addEventListener('DOMContentLoaded', ()=>{
  // Core elements
  const canvas = document.getElementById('posterCanvas');
  const ctx = canvas.getContext('2d');
  const posterListEl = document.getElementById('posterList');
  const addPosterBtn = document.getElementById('addPoster');
  const removePosterBtn = document.getElementById('removePoster');
  const navUploadBtn = document.getElementById('navUploadBtn');
  const navTemplateInput = document.getElementById('navTemplate');
  const openSettingsBtn = document.getElementById('openSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  const applyToAllChk = document.getElementById('applyToAll');
  const applyGlobalBtn = document.getElementById('applyGlobal');
  const globalFont = document.getElementById('globalFont');
  const globalColor = document.getElementById('globalColor');
  const globalSize = document.getElementById('globalSize');
  const templateSize = document.getElementById('templateSize');

  const firstText = document.getElementById('firstText');
  const secondText = document.getElementById('secondText');
  const thirdText = document.getElementById('thirdText');
  const applyResults = document.getElementById('applyResults');

  // names & teams inputs
  const nameFirst = document.getElementById('nameFirst');
  const teamFirst = document.getElementById('teamFirst');
  const nameSecond = document.getElementById('nameSecond');
  const teamSecond = document.getElementById('teamSecond');
  const nameThird = document.getElementById('nameThird');
  const teamThird = document.getElementById('teamThird');
  const applyNamesBtn = document.getElementById('applyNames');

  const selectOverlay = document.getElementById('selectOverlay');
  const overlayText = document.getElementById('overlayText');
  const fontFamily = document.getElementById('fontFamily');
  const fontSize = document.getElementById('fontSize');
  const fontColor = document.getElementById('fontColor');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');
  const centerBtn = document.getElementById('centerBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const duplicateBtn = document.getElementById('duplicateBtn');

  // Assets UI root
  const assetsListEl = document.getElementById('assetsList');

  // Navbar brand logos container
  const brandLogosEl = document.getElementById('brandLogos');

  // Posters store
  let posters = [];
  let activeIndex = -1;

  function makeEmptyPoster(name){
    return {
      id: Date.now()+Math.random(),
      name: name || `Poster ${posters.length+1}`,
      bgSrc: null,
      bgImage: null,
      width:800,
      height:1200,
      overlays:[
        {id:0,type:'text',label:'First',text:'',x:400,y:200,fontSize:64,color:'#ffffff',fontFamily:'Impact',bold:true,italic:false,align:'center'},
        {id:1,type:'text',label:'Second',text:'',x:400,y:340,fontSize:48,color:'#ffffff',fontFamily:'Arial',bold:false,italic:false,align:'center'},
        {id:2,type:'text',label:'Third',text:'',x:400,y:480,fontSize:40,color:'#ffffff',fontFamily:'Arial',bold:false,italic:false,align:'center'},
        {id:3,type:'text',label:'Team 1',text:'',x:400,y:240,fontSize:28,color:'#ffffff',fontFamily:'Inter',bold:false,italic:false,align:'center'},
        {id:4,type:'text',label:'Team 2',text:'',x:400,y:380,fontSize:22,color:'#ffffff',fontFamily:'Inter',bold:false,italic:false,align:'center'},
        {id:5,type:'text',label:'Team 3',text:'',x:400,y:520,fontSize:20,color:'#ffffff',fontFamily:'Inter',bold:false,italic:false,align:'center'}
      ]
    };
  }

  function addPoster(name){
    const p = makeEmptyPoster(name);
    // if user selected a template size, initialize poster to that size
    if(templateSize){ const v = templateSize.value; const map = getSizeForKey(v); if(map){ p.width = map.w; p.height = map.h; // position overlays relative to center
        p.overlays.forEach(o=>{ o.x = (o.x / 800) * p.width; o.y = (o.y / 1200) * p.height; if(o.w) o.w = (o.w / 800) * p.width; if(o.h) o.h = (o.h / 1200) * p.height; if(o.fontSize) o.fontSize = Math.max(10, Math.round((o.fontSize / 1200) * p.height)); }); } }
    posters.push(p);
    renderPosterList();
    selectPoster(posters.length-1);
  }

  function getSizeForKey(key){
    if(!key) return null;
    if(key === '9:16') return {w:1080, h:1920};
    if(key === '4:5') return {w:1080, h:1350};
    if(key === '5:5') return {w:1200, h:1200};
    return null;
  }

  function setPosterSize(p, newW, newH){
    if(!p) return;
    const oldW = p.width || canvas.width || 800;
    const oldH = p.height || canvas.height || 1200;
    const sx = newW / oldW;
    const sy = newH / oldH;
    // scale overlays positions and dimensions
    p.overlays.forEach(o=>{
      o.x = Math.round((o.x || 0) * sx);
      o.y = Math.round((o.y || 0) * sy);
      if(o.w) o.w = Math.round(o.w * sx);
      if(o.h) o.h = Math.round((o.h || o.w) * sy);
      if(o.fontSize) o.fontSize = Math.max(8, Math.round(o.fontSize * Math.min(sx, sy)));
    });
    p.width = newW; p.height = newH;
    if(p.bgImage){ /* background image will be stretched when drawn */ }
  }

  function duplicatePoster(index){
    const src = posters[index];
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = Date.now()+Math.random();
    copy.name = src.name + ' copy';
    if(src.bgSrc){
      copy.bgImage = new Image();
      copy.bgImage.onload = ()=>{ if(index===activeIndex) render(); };
      copy.bgImage.src = src.bgSrc;
    }
    posters.push(copy);
    renderPosterList();
    selectPoster(posters.length-1);
  }

  function removePoster(index){
    if(posters.length<=1) return alert('Keep at least one poster');
    posters.splice(index,1);
    const newIndex = Math.max(0,index-1);
    renderPosterList();
    selectPoster(newIndex);
  }

  function renderPosterList(){
    posterListEl.innerHTML = '';
    posters.forEach((p,i)=>{
      const el = document.createElement('div');
      el.className = 'poster-item' + (i===activeIndex? ' active':'');
      el.innerHTML = `<div style="flex:1">${p.name}</div><div class="muted">${p.bgSrc? 'Template' : 'Blank'}</div>`;
      el.addEventListener('click', ()=>selectPoster(i));
      posterListEl.appendChild(el);
    });
  }

  function updateOverlaySelect(){
    const p = posters[activeIndex];
    selectOverlay.innerHTML = '';
    p.overlays.forEach((o,idx)=>{
      const opt = document.createElement('option'); opt.value = String(idx); opt.textContent = o.label || (o.type === 'image' ? (o.name||'Image') : `Text ${idx+1}`);
      selectOverlay.appendChild(opt);
    });
  }

  function selectPoster(i){
    if(i<0 || i>=posters.length) return;
    activeIndex = i;
    renderPosterList();
    loadActivePosterToUI();
    render();
  }

  function loadActivePosterToUI(){
    const p = posters[activeIndex];
    updateOverlaySelect();
    selectOverlay.value = '0';
    const o = p.overlays[0];
    overlayText.value = o.text || '';
    fontFamily.value = o.fontFamily || '';
    fontSize.value = o.fontSize || 48;
    fontColor.value = o.color || '#ffffff';
  }

  function render(){
    const p = posters[activeIndex];
    if(!p) return;
    canvas.width = p.width; canvas.height = p.height;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(p.bgImage){ ctx.drawImage(p.bgImage,0,0,canvas.width,canvas.height); } else { ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); }

    p.overlays.forEach((o,idx)=>{
      if(o.type === 'image'){
        if(!o.img){ o.img = new Image(); o.img.src = o.src; o.w = o.w || Math.min(200, canvas.width*0.18); o.h = o.h || (o.w * (o.img.height || 1) / (o.img.width || 1)); o.img.onload = ()=>{ o.w = o.w || o.img.width; o.h = o.h || o.img.height; render(); }; }
        const iw = o.w || 120; const ih = o.h || 120;
        ctx.drawImage(o.img, o.x - iw/2, o.y - ih/2, iw, ih);
        if(idx===Number(selectOverlay.value)){ ctx.save(); ctx.strokeStyle='#7c3aed'; ctx.setLineDash([6,4]); ctx.strokeRect(o.x - iw/2 -6, o.y - ih/2 -6, iw+12, ih+12); ctx.restore(); }
      } else {
        const fs = Number(o.fontSize);
        ctx.font = `${o.bold? 'bold ' : ''}${o.italic? 'italic ' : ''}${fs}px ${o.fontFamily}`;
        ctx.fillStyle = o.color || '#000'; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'top'; ctx.lineWidth = Math.max(2, Math.round(fs/18)); ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        const lines = String(o.text).split('\n'); let y = o.y; lines.forEach(line=>{ ctx.strokeText(line,o.x,y); ctx.fillText(line,o.x,y); y += fs*1.1; });
        if(idx===Number(selectOverlay.value)){ const metrics = ctx.measureText(lines[0]||''); const w = metrics.width; const h = fs*lines.length*1.1; const left = (o.align==='center')? o.x-w/2 : (o.align==='right'? o.x-w : o.x); ctx.save(); ctx.strokeStyle='#7c3aed'; ctx.setLineDash([6,4]); ctx.strokeRect(left-6,o.y-6,w+12,h+12); ctx.restore(); }
      }
    });
  }

  function addImageOverlay(src, name){
    const p = posters[activeIndex];
    const overlay = { id: Date.now()+Math.random(), type:'image', src, name, x: p.width/2, y: p.height*0.25, w: Math.min(200, p.width*0.18), h: null };
    p.overlays.push(overlay);
    updateOverlaySelect();
    selectOverlay.value = String(p.overlays.length-1);
    loadActivePosterToUI();
    render();
  }

  // render assets UI using window.assets (from assets.js)
  function renderAssets(){
    if(!assetsListEl) return;
    assetsListEl.innerHTML = '';
    const items = window.assets || [];
    items.forEach(a=>{
      const btn = document.createElement('button'); btn.className='btn ghost small'; btn.title = a.name; btn.style.padding='6px'; btn.style.display='flex'; btn.style.alignItems='center'; btn.style.justifyContent='center';
      const img = document.createElement('img'); img.src = a.src; img.style.width='64px'; img.style.height='64px'; img.style.objectFit='contain'; img.style.background='white'; img.style.borderRadius='6px';
      btn.appendChild(img);
      btn.addEventListener('click', ()=> addImageOverlay(a.src, a.name));
      assetsListEl.appendChild(btn);
    });
  }

  // --- Init ---
  addPoster('Poster 1');
  renderAssets();

  // wire template size selector
  if(templateSize){ templateSize.addEventListener('change', ()=>{
    const key = templateSize.value; const sz = getSizeForKey(key); if(!sz) return;
    if(applyToAllChk && applyToAllChk.checked){ posters.forEach(p=> setPosterSize(p, sz.w, sz.h)); }
    else { const p = posters[activeIndex]; if(p) setPosterSize(p, sz.w, sz.h); }
    renderPosterList(); render();
  }); }

  // Navbar images removed per request — no logos will be populated here.

  // Views: home (carousel) and results (editor)
  const homeView = document.getElementById('homeView');
  const resultsView = document.getElementById('resultsView');
  const navHome = document.getElementById('navHome');
  function showHome(){ if(homeView) homeView.style.display = 'block'; if(resultsView) resultsView.style.display = 'none'; if(navHome) navHome.classList.add('active'); }
  // Show Results (poster editor) and hide Home
  function showResults(){ if(homeView) homeView.style.display = 'none'; if(resultsView) resultsView.style.display = 'grid'; if(navHome) navHome.classList.remove('active'); }
  // wire Create/Upload buttons
  const heroCreate = document.getElementById('heroCreate');
  const heroUploadTemplate = document.getElementById('heroUploadTemplate');
  const uploadResultsPage = document.getElementById('uploadResultsPage');
  const uploadResultsApply = document.getElementById('uploadResultsApply');
  const uploadResultsCancel = document.getElementById('uploadResultsCancel');
  const uploadFirstName = document.getElementById('uploadFirstName');
  const uploadFirstTeam = document.getElementById('uploadFirstTeam');
  const uploadSecondName = document.getElementById('uploadSecondName');
  const uploadSecondTeam = document.getElementById('uploadSecondTeam');
  const uploadThirdName = document.getElementById('uploadThirdName');
  const uploadThirdTeam = document.getElementById('uploadThirdTeam');
  const uploadCategory = document.getElementById('uploadCategory');
  const uploadProgram = document.getElementById('uploadProgram');
  const uploadApplyToAll = document.getElementById('uploadApplyToAll');

  // Show the upload results form instead of jumping straight to editor
  if(heroCreate) heroCreate.addEventListener('click', ()=>{
    if(uploadResultsPage) { uploadResultsPage.style.display = 'block'; if(homeView) homeView.style.display='none'; }
  });
  if(heroUploadTemplate && document.getElementById('navTemplate')) heroUploadTemplate.addEventListener('click', ()=> document.getElementById('navTemplate').click());
  if(navHome) navHome.addEventListener('click', showHome);

  // Facility card settings buttons: results UI removed — stay on Home; allow template upload
  document.querySelectorAll('.card-settings').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const action = btn.dataset.action;
      showHome();
      if(action === 'templates' && document.getElementById('navTemplate')) document.getElementById('navTemplate').click();
    });
  });

  // UI bindings
  addPosterBtn.addEventListener('click', ()=> addPoster());
  removePosterBtn.addEventListener('click', ()=> removePoster(activeIndex));
  duplicateBtn.addEventListener('click', ()=> duplicatePoster(activeIndex));

  if(navUploadBtn && document.getElementById('navTemplate')){ navUploadBtn.addEventListener('click', ()=> document.getElementById('navTemplate').click()); }
  const navTemplateEl = document.getElementById('navTemplate');
  if(navTemplateEl) navTemplateEl.addEventListener('change', e=>{ const file = e.target.files[0]; if(!file) return; const url = URL.createObjectURL(file); if(applyToAllChk && applyToAllChk.checked){ posters.forEach(p=>{ p.bgSrc = url; p.bgImage = new Image(); p.bgImage.src = url; }); } else { const p = posters[activeIndex]; p.bgSrc = url; p.bgImage = new Image(); p.bgImage.onload = ()=> render(); p.bgImage.src = url; } render(); });

  if(openSettingsBtn) openSettingsBtn.addEventListener('click', ()=> settingsPanel.style.display = 'block');
  const closeSettingsBtn = document.getElementById('closeSettings');
  if(closeSettingsBtn) closeSettingsBtn.addEventListener('click', ()=> settingsPanel.style.display = 'none');

  applyGlobalBtn.addEventListener('click', ()=>{ const fam = globalFont.value; const col = globalColor.value; const size = Number(globalSize.value); if(applyToAllChk.checked){ posters.forEach(p=> p.overlays.forEach(o=>{ if(o.type==='text'){ o.fontFamily = fam; o.color = col; o.fontSize = size; } })); } else { const p = posters[activeIndex]; p.overlays.forEach(o=>{ if(o.type==='text'){ o.fontFamily = fam; o.color = col; o.fontSize = size; } }); } render(); });

  applyResults.addEventListener('click', ()=>{
    if(applyToAllChk && applyToAllChk.checked){
      posters.forEach(p=>{
        if(p.overlays[0]) p.overlays[0].text = firstText.value || p.overlays[0].text;
        if(p.overlays[1]) p.overlays[1].text = secondText.value || p.overlays[1].text;
        if(p.overlays[2]) p.overlays[2].text = thirdText.value || p.overlays[2].text;
      });
    } else {
      const p = posters[activeIndex]; if(!p) return;
      if(p.overlays[0]) p.overlays[0].text = firstText.value || p.overlays[0].text;
      if(p.overlays[1]) p.overlays[1].text = secondText.value || p.overlays[1].text;
      if(p.overlays[2]) p.overlays[2].text = thirdText.value || p.overlays[2].text;
    }
    render();
  });

  // Apply names + team names (supports apply to all)
  if(applyNamesBtn) applyNamesBtn.addEventListener('click', ()=>{
    const vals = {
      n1: nameFirst ? nameFirst.value : '', t1: teamFirst ? teamFirst.value : '',
      n2: nameSecond ? nameSecond.value : '', t2: teamSecond ? teamSecond.value : '',
      n3: nameThird ? nameThird.value : '', t3: teamThird ? teamThird.value : ''
    };
    if(applyToAllChk && applyToAllChk.checked){
      posters.forEach(pp=>{
        while(pp.overlays.length < 6){ pp.overlays.push({id:Date.now()+Math.random(), type:'text', text:'', x:400, y:400, fontSize:20, color:'#ffffff', fontFamily:'Inter'}); }
        pp.overlays[0].text = vals.n1 || pp.overlays[0].text;
        pp.overlays[1].text = vals.n2 || pp.overlays[1].text;
        pp.overlays[2].text = vals.n3 || pp.overlays[2].text;
        pp.overlays[3].text = vals.t1 || pp.overlays[3].text;
        pp.overlays[4].text = vals.t2 || pp.overlays[4].text;
        pp.overlays[5].text = vals.t3 || pp.overlays[5].text;
      });
    } else {
      const p = posters[activeIndex]; if(!p) return;
      while(p.overlays.length < 6){ p.overlays.push({id:Date.now()+Math.random(), type:'text', text:'', x:400, y:400, fontSize:20, color:'#ffffff', fontFamily:'Inter'}); }
      p.overlays[0].text = vals.n1 || p.overlays[0].text;
      p.overlays[1].text = vals.n2 || p.overlays[1].text;
      p.overlays[2].text = vals.n3 || p.overlays[2].text;
      p.overlays[3].text = vals.t1 || p.overlays[3].text;
      p.overlays[4].text = vals.t2 || p.overlays[4].text;
      p.overlays[5].text = vals.t3 || p.overlays[5].text;
    }
    render();
    updateOverlaySelect();
  });

  // Upload Results form handlers
  if(uploadResultsCancel) uploadResultsCancel.addEventListener('click', ()=>{ if(uploadResultsPage) uploadResultsPage.style.display='none'; if(homeView) homeView.style.display='block'; });
  // backup storage so we can revert
  let postersBackup = null;
  let appliedFlag = false;
  // helper: ensure image is loaded
  function loadImage(src){ return new Promise((res,rej)=>{ if(!src) return res(null); const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = ()=> res(img); img.onerror = ()=> res(null); img.src = src; }); }

  // render any poster p into an offscreen canvas and return dataURL
  async function renderPosterToDataURL(p){ const c = document.createElement('canvas'); c.width = p.width||800; c.height = p.height||1200; const cx = c.getContext('2d'); // background
    if(p.bgSrc){ const bg = await loadImage(p.bgSrc); if(bg){ cx.drawImage(bg,0,0,c.width,c.height); } else { cx.fillStyle = '#ffffff'; cx.fillRect(0,0,c.width,c.height); } } else { cx.fillStyle = '#ffffff'; cx.fillRect(0,0,c.width,c.height); }
    // draw overlays
    for(const o of (p.overlays||[])){
      if(o.type === 'image'){
        const im = await loadImage(o.src||o.src||o.img?.src);
        const iw = o.w || Math.min(200, c.width*0.18);
        const ih = o.h || (im ? (iw * (im.height||1) / (im.width||1)) : iw);
        if(im) cx.drawImage(im, o.x - iw/2, o.y - ih/2, iw, ih);
      } else {
        const fs = Number(o.fontSize) || 24; cx.font = `${o.bold? 'bold ' : ''}${o.italic? 'italic ' : ''}${fs}px ${o.fontFamily||'Arial'}`;
        cx.fillStyle = o.color || '#000'; cx.textAlign = o.align || 'center'; cx.textBaseline = 'top'; cx.lineWidth = Math.max(2, Math.round(fs/18)); cx.strokeStyle = 'rgba(0,0,0,0.45)';
        const lines = String(o.text||'').split('\n'); let y = o.y || 0; for(const line of lines){ cx.strokeText(line, o.x, y); cx.fillText(line, o.x, y); y += fs*1.1; }
      }
    }
    return c.toDataURL('image/png');
  }

  // Download applied for selected posters (all if applyToAll checked)
  async function downloadApplied(all){ const targets = all ? posters : [posters[activeIndex]]; for(let i=0;i<targets.length;i++){ const p = targets[i]; const data = await renderPosterToDataURL(p); const a = document.createElement('a'); a.href = data; const meta = ((p.category? p.category + '_' : '') + (p.program? p.program + '_' : '')).replace(/\s+/g,''); a.download = `${p.name.replace(/\s+/g,'_')}_${meta||''}.png`; document.body.appendChild(a); a.click(); a.remove(); await new Promise(r=>setTimeout(r,200)); } alert('Download started for ' + (all? targets.length : 1) + ' template(s).'); }

  // revert posters from backup
  function revertTemplates(){ if(!postersBackup) return alert('No backup available'); posters = JSON.parse(JSON.stringify(postersBackup)); // reinstate bgImage objects
    posters.forEach(p=>{ if(p.bgSrc){ p.bgImage = new Image(); p.bgImage.onload = ()=>{}; p.bgImage.src = p.bgSrc; } }); renderPosterList(); selectPoster(0); render(); appliedFlag = false; postersBackup = null; alert('Templates reverted to original state'); }

  if(uploadResultsApply) uploadResultsApply.addEventListener('click', ()=>{
    // copy values into the settings inputs and apply
    // backup current posters state before applying
    if(!postersBackup) postersBackup = JSON.parse(JSON.stringify(posters));
    appliedFlag = true;
    if(nameFirst) nameFirst.value = uploadFirstName ? uploadFirstName.value : '';
    if(teamFirst) teamFirst.value = uploadFirstTeam ? uploadFirstTeam.value : '';
    if(nameSecond) nameSecond.value = uploadSecondName ? uploadSecondName.value : '';
    if(teamSecond) teamSecond.value = uploadSecondTeam ? uploadSecondTeam.value : '';
    if(nameThird) nameThird.value = uploadThirdName ? uploadThirdName.value : '';
    if(teamThird) teamThird.value = uploadThirdTeam ? uploadThirdTeam.value : '';
    // set category/program on posters (respect upload form checkbox first)
    const cat = uploadCategory ? uploadCategory.value : '';
    const prog = uploadProgram ? uploadProgram.value : '';
    const shouldApplyAll = (uploadApplyToAll && uploadApplyToAll.checked) || (applyToAllChk && applyToAllChk.checked);
    if(shouldApplyAll){ posters.forEach(pp=>{ pp.category = cat; pp.program = prog; }); } else { const p = posters[activeIndex]; if(p){ p.category = cat; p.program = prog; } }
    // trigger existing applyNames logic
    if(applyNamesBtn) applyNamesBtn.click();
    // save the applied posters into Verified Results
    try{ captureCurrentAsVerified(); }catch(e){ console.warn('failed to capture verified', e); }
    // hide form and show home
    if(uploadResultsPage) uploadResultsPage.style.display='none'; if(homeView) homeView.style.display='block';
    alert('Results applied' + (shouldApplyAll ? ' to all templates.' : '.'));
  });

  // hook download and revert buttons
  const downloadAppliedBtn = document.getElementById('downloadAppliedBtn');
  const revertTemplatesBtn = document.getElementById('revertTemplatesBtn');
  if(downloadAppliedBtn) downloadAppliedBtn.addEventListener('click', ()=>{ const all = (uploadApplyToAll && uploadApplyToAll.checked) || (applyToAllChk && applyToAllChk.checked); downloadApplied(all); });
  if(revertTemplatesBtn) revertTemplatesBtn.addEventListener('click', ()=>{ if(confirm('Revert templates to original state?')) revertTemplates(); });

  selectOverlay.addEventListener('change', ()=>{ const p = posters[activeIndex]; const o = p.overlays[Number(selectOverlay.value)]; overlayText.value = o.text || ''; fontFamily.value = o.fontFamily || ''; fontSize.value = o.fontSize || 48; fontColor.value = o.color || '#ffffff'; render(); });

  overlayText.addEventListener('input', ()=>{ posters[activeIndex].overlays[Number(selectOverlay.value)].text = overlayText.value; render(); });
  fontFamily.addEventListener('change', ()=>{ posters[activeIndex].overlays[Number(selectOverlay.value)].fontFamily = fontFamily.value; render(); });
  fontSize.addEventListener('input', ()=>{ posters[activeIndex].overlays[Number(selectOverlay.value)].fontSize = Number(fontSize.value); render(); });
  fontColor.addEventListener('input', ()=>{ posters[activeIndex].overlays[Number(selectOverlay.value)].color = fontColor.value; render(); });
  boldBtn.addEventListener('click', ()=>{ const o=posters[activeIndex].overlays[Number(selectOverlay.value)]; o.bold = !o.bold; render(); });
  italicBtn.addEventListener('click', ()=>{ const o=posters[activeIndex].overlays[Number(selectOverlay.value)]; o.italic = !o.italic; render(); });
  centerBtn.addEventListener('click', ()=>{ const o=posters[activeIndex].overlays[Number(selectOverlay.value)]; o.align = o.align==='center' ? 'left' : 'center'; render(); });

  // drag support
  let dragging = null; let dragOffset = {x:0,y:0};
  function getHitOverlay(x,y){ const p = posters[activeIndex]; for(let i=p.overlays.length-1;i>=0;i--){ const o=p.overlays[i]; if(o.type==='image'){ const iw = o.w||120; const ih = o.h||120; const left = o.x - iw/2; const top = o.y - ih/2; if(x>=left-8 && x<=left+iw+8 && y>=top-8 && y<=top+ih+8) return i; } else { ctx.font = `${o.bold? 'bold ':' '}${o.italic? 'italic ':' '}${o.fontSize}px ${o.fontFamily}`; const lines = String(o.text).split('\n'); const w = ctx.measureText(lines[0]||'').width; const h = o.fontSize*lines.length*1.1; const left = (o.align==='center') ? o.x - w/2 : (o.align==='right'? o.x-w : o.x); if(x>=left-8 && x<=left+w+8 && y>=o.y-8 && y<=o.y+h+8) return i; } } return null; }
  canvas.addEventListener('pointerdown', e=>{ const rect=canvas.getBoundingClientRect(); const x=(e.clientX-rect.left)*(canvas.width/rect.width); const y=(e.clientY-rect.top)*(canvas.height/rect.height); const hit = getHitOverlay(x,y); if(hit!==null){ dragging=hit; const o = posters[activeIndex].overlays[hit]; dragOffset.x = x - o.x; dragOffset.y = y - o.y; selectOverlay.value = String(hit); selectOverlay.dispatchEvent(new Event('change')); } });
  window.addEventListener('pointermove', e=>{ if(dragging===null) return; const rect=canvas.getBoundingClientRect(); const x=(e.clientX-rect.left)*(canvas.width/rect.width); const y=(e.clientY-rect.top)*(canvas.height/rect.height); const o = posters[activeIndex].overlays[dragging]; o.x = x - dragOffset.x; o.y = y - dragOffset.y; render(); });
  window.addEventListener('pointerup', ()=> dragging = null);

  downloadBtn.addEventListener('click', ()=>{ const data = canvas.toDataURL('image/png'); const a = document.createElement('a'); a.href = data; a.download = posters[activeIndex].name.replace(/\s+/g,'_') + '.png'; a.click(); });

  // helper: load images if bgSrc exists
  setInterval(()=>{ posters.forEach(p=>{ if(p.bgSrc && !p.bgImage){ p.bgImage=new Image(); p.bgImage.onload=render; p.bgImage.src=p.bgSrc; } }); },300);
  // Verified Results storage (simple array under localStorage key)
  const verifiedIconBtn = document.getElementById('verifiedIconBtn');
  const verifiedResultsPage = document.getElementById('verifiedResultsPage');
  const captureVerifiedBtn = document.getElementById('captureVerifiedBtn');
  const verifiedListEl = document.getElementById('verifiedList');
  const closeVerifiedBtn = document.getElementById('closeVerifiedBtn');

  const VERIFIED_KEY = 'verified_results';
  function getVerified(){ try{ const txt = localStorage.getItem(VERIFIED_KEY); return txt ? JSON.parse(txt) : []; }catch(e){ return []; } }
  function saveVerified(arr){ localStorage.setItem(VERIFIED_KEY, JSON.stringify(arr || [])); }

  function captureCurrentAsVerified(){ const snap = JSON.parse(JSON.stringify(posters)); const meta = { savedAt: Date.now(), count: snap.length, category: (snap[0] && snap[0].category) || '', program: (snap[0] && snap[0].program) || '' }; const arr = getVerified(); arr.unshift({ id: Date.now()+Math.random(), meta, posters: snap }); saveVerified(arr); listVerified(); alert('Captured current posters as verified entry'); }

  function listVerified(){ if(!verifiedListEl) return; const arr = getVerified(); verifiedListEl.innerHTML = ''; if(!arr.length) { verifiedListEl.innerHTML = '<div class="muted">No verified entries yet.</div>'; return; }
    arr.forEach((entry, idx)=>{
      const row = document.createElement('div'); row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='8px 0';
      const left = document.createElement('div'); left.innerHTML = `<strong>Entry ${arr.length-idx}</strong><div class="muted" style="font-size:12px">${new Date(entry.meta.savedAt).toLocaleString()} • ${entry.meta.count} poster(s) ${entry.meta.category? '• '+entry.meta.category : ''} ${entry.meta.program? '• '+entry.meta.program : ''}</div>`;
      const right = document.createElement('div'); right.style.display='flex'; right.style.gap='8px';
      const dl = document.createElement('button'); dl.className='btn small'; dl.textContent='Download Images'; dl.addEventListener('click', ()=> downloadVerifiedImages(idx));
      const load = document.createElement('button'); load.className='btn small ghost'; load.textContent='Load'; load.addEventListener('click', ()=>{ if(confirm('Load this verified entry into editor? This will replace current posters.')){ loadVerifiedEntry(idx); } });
      const del = document.createElement('button'); del.className='btn small ghost'; del.textContent='Delete'; del.addEventListener('click', ()=>{ if(confirm('Delete this verified entry?')){ deleteVerifiedEntry(idx); } });
      right.appendChild(dl); right.appendChild(load); right.appendChild(del);
      row.appendChild(left); row.appendChild(right); verifiedListEl.appendChild(row);
    });
  }

  async function downloadVerifiedImages(index){ const arr = getVerified(); const entry = arr[index]; if(!entry) return alert('Missing entry'); for(let i=0;i<entry.posters.length;i++){ const p = entry.posters[i]; const data = await renderPosterToDataURL(p); const a = document.createElement('a'); a.href = data; a.download = `${(p.name||'poster')}_verified_${index+1}_${i+1}.png`; document.body.appendChild(a); a.click(); a.remove(); await new Promise(r=>setTimeout(r,150)); } }

  function loadVerifiedEntry(index){ const arr = getVerified(); const entry = arr[index]; if(!entry) return alert('Missing entry'); posters = JSON.parse(JSON.stringify(entry.posters)); posters.forEach(p=>{ if(p.bgSrc){ p.bgImage = new Image(); p.bgImage.onload = render; p.bgImage.src = p.bgSrc; } }); renderPosterList(); selectPoster(0); render(); }

  function deleteVerifiedEntry(index){ const arr = getVerified(); arr.splice(index,1); saveVerified(arr); listVerified(); }

  function clearVerifiedAll(){ if(!confirm('Clear all verified entries?')) return; saveVerified([]); listVerified(); }

  if(verifiedIconBtn) verifiedIconBtn.addEventListener('click', ()=>{ if(verifiedResultsPage) verifiedResultsPage.style.display='block'; if(homeView) homeView.style.display='none'; listVerified(); });
  if(captureVerifiedBtn) captureVerifiedBtn.addEventListener('click', ()=> captureCurrentAsVerified());
  if(closeVerifiedBtn) closeVerifiedBtn.addEventListener('click', ()=>{ if(verifiedResultsPage) verifiedResultsPage.style.display='none'; if(homeView) homeView.style.display='block'; });
  
  // Simple carousel: populate slides from window.assets plus provided images
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  if(carouselTrack){
    // use only the provided images for the carousel
    const carouselSources = [
      'results/img1.svg',
      'results/img2.svg',
      'results/img3.svg'
    ];

    let slides = [];
    let current = 0;
    let autoplayInterval = 4500;
    let autoplayTimer = null;

    const dotsWrap = document.createElement('div'); dotsWrap.className = 'carousel-dots';
    function updateDots(){ dotsWrap.innerHTML = ''; slides.forEach((_,i)=>{ const d = document.createElement('div'); d.className='carousel-dot' + (i===current? ' active':''); d.addEventListener('click', ()=> showSlide(i)); dotsWrap.appendChild(d); }); }

    function showSlide(i){ if(!slides.length) return; current = (i+slides.length)%slides.length; carouselTrack.style.transform = `translateX(-${current*100}%)`; updateDots(); }

    function populateCarousel(){
      carouselTrack.innerHTML = '';
      carouselSources.forEach(src=>{
        const slide = document.createElement('div'); slide.className = 'slide';
        const img = document.createElement('img'); img.src = src; img.alt = '';
        slide.appendChild(img);
        carouselTrack.appendChild(slide);
      });
      // attach dots below track
      carouselTrack.parentNode.appendChild(dotsWrap);
      slides = Array.from(carouselTrack.querySelectorAll('.slide'));
      slides.forEach(s=>{ const img = s.querySelector('img'); if(img) img.addEventListener('click', ()=>{ addImageOverlay(img.src, img.alt || 'carousel'); }); });
      updateDots();
      showSlide(0);
      startAutoplay();
    }

    function startAutoplay(){ stopAutoplay(); autoplayTimer = setInterval(()=> showSlide(current+1), autoplayInterval); }
    function stopAutoplay(){ if(autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }

    if(carouselPrev) carouselPrev.addEventListener('click', ()=> { showSlide(current-1); stopAutoplay(); });
    if(carouselNext) carouselNext.addEventListener('click', ()=> { showSlide(current+1); stopAutoplay(); });
    // pause on hover
    carouselTrack.parentNode.addEventListener('mouseenter', ()=> stopAutoplay());
    carouselTrack.parentNode.addEventListener('mouseleave', ()=> startAutoplay());
    populateCarousel();
  }
});
