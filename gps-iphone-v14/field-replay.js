/* Read-only actual replay + manual geographic calibration. No editor/Firebase dependency. */
(function(root){
  'use strict';
  const G=root.PACFieldGeometry,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
  const host=$('fieldReplayHost');
  if(!host)return;
  host.innerHTML=`
    <div class="field-tabs" role="group" aria-label="Result view">
      <button type="button" class="btn btn-outline" id="fieldRouteTab" aria-pressed="true">GPS route</button>
      <button type="button" class="btn btn-outline" id="fieldReplayTab" aria-pressed="false">Field Replay</button>
    </div>
    <section id="fieldReplayPanel" hidden aria-label="Actual GPS Field Replay">
      <h3>Field Performance Replay</h3>
      <p class="field-muted">Actual phone GPS · approximate positions. Route colors show experimental GPS speed estimates; grey means insufficient quality. Actual data only.</p>
      <label class="field-label">Saved field <select id="fieldSaved"><option value="">Choose a calibrated field</option></select></label>
      <p id="fieldStatus" role="status"></p>
      <div class="field-calibrate-actions"><button id="fieldCalibrate" class="btn btn-gold" type="button">Calibrate field</button><button id="fieldRecalibrate" class="btn btn-outline" type="button" disabled>Recalibrate selected</button></div>
      <p id="fieldCalibrationMessage" role="status"></p>
      <div id="fieldCanvasPanel" hidden>
        <p class="field-muted">Schematic field · actual GPS only. Drag to pan; Fit includes off-field points.</p>
        <div class="field-zoom" role="group" aria-label="Field zoom">
          <button type="button" class="btn btn-outline" id="fieldZoomOut" aria-label="Zoom out">−</button>
          <button type="button" class="btn btn-outline" id="fieldZoomIn" aria-label="Zoom in">+</button>
          <button type="button" class="btn btn-outline" id="fieldFit">Fit all</button><button type="button" class="btn btn-outline" id="fieldFocus">Field</button><button type="button" class="btn btn-outline" id="fieldExpand">⛶ Full screen</button>
        </div>
        <svg id="fieldSvg" class="field-svg" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Actual GPS trajectory on the calibrated field">
          <image id="fieldBackground" x="0" y="0" width="1536" height="1024" preserveAspectRatio="xMidYMid meet"/>
          <g id="fieldPaths" fill="none" stroke="#ffc72c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></g>
          <circle id="fieldStart" r="12" fill="#35d288" stroke="#060606" stroke-width="3"/>
          <circle id="fieldEnd" r="12" fill="#ff5762" stroke="#060606" stroke-width="3"/>
          <circle id="fieldMarker" r="13" fill="#fff" stroke="#ffc72c" stroke-width="5"/>
        </svg>
        <p class="field-muted">Green = first valid sample · red = last valid sample · white = replay marker. Blank timeline bands = no continuous GPS data.</p>
        <div id="fieldGapBar" class="field-gap-bar" aria-label="Missing GPS intervals"></div>
        <label class="field-label">Elapsed timeline <input id="fieldTimeline" type="range" min="0" max="1" step="100" value="0"></label>
        <div class="field-play-controls"><button type="button" class="btn btn-gold" id="fieldPlay">Play</button><output id="fieldTime">0:00</output><label>Replay <select id="fieldRate"><option value="1">1×</option><option value="4">4×</option><option value="10">10×</option></select></label></div>
        <p id="fieldMarkerStatus" role="status"></p>
        <p id="fieldQuality"></p>
      </div>
    </section>`;
  // Field first; technical calibration and setup remain available on demand.
  const details=document.createElement('details');details.className='field-details';details.innerHTML='<summary>Field calibration · details & settings</summary>';
  const panel=$('fieldReplayPanel'),intro=panel.querySelector('.field-muted');
  [$('fieldStatus'),panel.querySelector('.field-calibrate-actions'),$('fieldCalibrationMessage'),intro].forEach(n=>details.appendChild(n));
  const qualityDetails=document.createElement('details');qualityDetails.className='field-details';qualityDetails.innerHTML='<summary>GPS data quality</summary>';qualityDetails.appendChild($('fieldQuality'));$('fieldCanvasPanel').appendChild(qualityDetails);
  panel.appendChild(details);
  const headline=document.createElement('p');headline.id='fieldHeadline';headline.className='field-headline';panel.insertBefore(headline,$('fieldCanvasPanel'));
  const metrics=document.createElement('p');metrics.id='fieldMetrics';metrics.className='field-headline';$('fieldCanvasPanel').appendChild(metrics);
  const analyticsPanel=document.createElement('section');analyticsPanel.id='fieldAnalytics';analyticsPanel.className='field-details';$('fieldCanvasPanel').appendChild(analyticsPanel);
  const fieldStage=document.createElement('div');fieldStage.id='fieldStage';
  $('fieldCanvasPanel').insertBefore(fieldStage,$('fieldSvg'));
  const fieldDrawing=document.createElementNS(NS,'g');fieldDrawing.id='fieldDrawing';while($('fieldSvg').firstChild)fieldDrawing.appendChild($('fieldSvg').firstChild);$('fieldSvg').appendChild(fieldDrawing);
  fieldStage.appendChild($('fieldSvg'));fieldStage.appendChild(panel.querySelector('.field-zoom'));
  const stageControls=document.createElement('div');stageControls.className='field-stage-controls';
  [$('fieldGapBar'),$('fieldTimeline').parentElement,panel.querySelector('.field-play-controls'),$('fieldMarkerStatus')].forEach(n=>stageControls.appendChild(n));fieldStage.appendChild(stageControls);
  let fieldOnly=true;
  const portrait=()=>fieldStage.clientHeight>fieldStage.clientWidth;
  const KEY='pac-gps-field-calibrations-v1';
  let records=[],bindings={},storageError=false,storeNeedsRecovery=false,session=null,model=null,calibration=null,tab='route';
  let playing=false,frame=0,time=0,started=0,startTime=0,zoom=1,pan={x:0,y:0};
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'{"records":[],"bindings":{}}');
    if(!Array.isArray(saved.records)||!saved.bindings||typeof saved.bindings!=='object')throw Error('Invalid local calibration store');
    // Preserve ALL prior records, including unsupported ones, when adding a field.
    records=saved.records;
    bindings=saved.bindings;
  }catch(_){storageError=true;storeNeedsRecovery=true;}
  function saveStore(nextRecords,nextBindings){
    if(storeNeedsRecovery)throw Error('Existing calibration store needs recovery; previous data was not overwritten');
    localStorage.setItem(KEY,JSON.stringify({records:nextRecords,bindings:nextBindings}));
    records=nextRecords;bindings=nextBindings;storageError=false;
  }
  function fillSaved(id=''){
    $('fieldSaved').replaceChildren(new Option('Choose a calibrated field',''));
    records.forEach(r=>{try{G.validateCalibration(r.calibration);if(typeof r.id==='string'&&typeof r.name==='string')$('fieldSaved').add(new Option(r.name+' · '+r.calibration.sport,r.id));}catch(_){}});
    $('fieldSaved').value=id;
  }
  function stop(){playing=false;cancelAnimationFrame(frame);$('fieldPlay').textContent='Play';}
  function selectTab(next){
    tab=next;stop();if(next!=='field')exitFieldScreen();$('screenSummary').classList.toggle('field-focused',next==='field');$('fieldReplayPanel').hidden=next!=='field';
    $('fieldRouteTab').setAttribute('aria-pressed',String(next==='route'));
    $('fieldReplayTab').setAttribute('aria-pressed',String(next==='field'));
    $('gpsRoutePanel').hidden=next==='field' && !!model;
    if(next==='field' && model)updateMarker();
  }
  function setView(){
    if(!model)return;
    const c=model.calibration,a=G.fieldToArtwork({x:0,y:0},c),b=G.fieldToArtwork({x:c.length,y:c.width},c),points=fieldOnly?[]:model.points;
    let left=Math.min(a.x,b.x)-25,top=Math.min(a.y,b.y)-25,right=Math.max(a.x,b.x)+25,bottom=Math.max(a.y,b.y)+25;
    points.forEach(p=>{left=Math.min(left,p.art.x-25);top=Math.min(top,p.art.y-25);right=Math.max(right,p.art.x+25);bottom=Math.max(bottom,p.art.y+25)});
    const width=(right-left)/zoom,height=(bottom-top)/zoom,x=(left+right-width)/2+pan.x,y=(top+bottom-height)/2+pan.y;
    const rotated=portrait();$('fieldDrawing').setAttribute('transform',rotated?'translate(1024 0) rotate(90)':'');
    $('fieldSvg').setAttribute('viewBox',(rotated?[1024-y-height,x,height,width]:[x,y,width,height]).join(' '));
  }
  function clock(ms){const sec=Math.floor(ms/1000);return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
  function updateMarker(){
    if(!model)return;
    const p=G.sampleAt(model,time);
    const index=model.points.findIndex(v=>v.t>=time),speed=model.analytics?.segments.find(v=>v.index===index);$('fieldMarker').setAttribute('stroke',speed?.color||'#8e939c');$('fieldMarker').style.display=p?'':'none';
    if(p){$('fieldMarker').setAttribute('cx',p.art.x);$('fieldMarker').setAttribute('cy',p.art.y);}
    $('fieldTimeline').value=String(time);$('fieldTime').value=clock(time)+' / '+clock(model.durationMs);
    $('fieldMarkerStatus').textContent=p?('GPS accuracy ±'+Math.round(p.accuracy)+' m · '+(p.interpolated?'visual interpolation between valid fixes':'recorded fix')+(speed?.kmh!==null&&speed?.kmh!==undefined?' · estimated '+speed.kmh.toFixed(1)+' km/h':' · speed unclassified')):'No GPS position at this time · gap / recording pause / no data';
  }
  function positionMarker(id,p){const node=$(id);node.style.display=p?'':'none';if(p){node.setAttribute('cx',p.art.x);node.setAttribute('cy',p.art.y);}}
  function render(){
    stop();model=null;$('fieldStatus').classList.remove('field-calibration-warning');$('fieldCanvasPanel').hidden=true;time=0;fieldOnly=true;zoom=1;pan={x:0,y:0};
    $('fieldGapBar').replaceChildren();$('fieldPaths').replaceChildren();$('fieldTimeline').value='0';
    $('fieldHeadline').textContent='Choose a saved field or open calibration settings below.';
    if(!calibration){
      $('fieldStatus').textContent=storageError?'Local calibration storage is unavailable or invalid. GPS route preview remains available.':'No validated field selected. Calibrate or choose a saved field; GPS route preview remains available.';
      $('fieldRecalibrate').disabled=true;selectTab(tab);return;
    }
    try{model=G.buildReplay(session,calibration);}catch(_){$('fieldStatus').textContent='Calibration/session invalid. Recalibrate; GPS route preview remains available.';selectTab(tab);return;}
    const c=model.calibration;
    const selected=records.find(r=>r.id===$('fieldSaved').value);$('fieldHeadline').textContent=(selected?.name||'Saved field')+' · '+c.sport+' · '+(c.validationStatus==='VALID'?'Geometry checked · GPS approximate':'APPROXIMATE · schematic field')+(c.selectionMode==='area'?' · internal markings unknown':'');
    $('fieldRecalibrate').disabled=false;
    $('fieldMetrics').textContent='Distance '+((session.totalDistance||0)/1000).toFixed(2)+' km · Max speed '+((session.maxSpeed||0)*3.6).toFixed(1)+' km/h · GPS points '+model.points.length;
    $('fieldTimeline').max=String(Math.max(1,model.durationMs));
    $('fieldStatus').textContent='Calibration: '+(c.validationStatus==='APPROXIMATE'?'APPROXIMATE — indicative Field Replay':c.validationStatus==='VALID'?'VALID geometry — geographic accuracy unknown':'legacy geometry — approximate')+' · '+c.sport+' '+c.length.toFixed(1)+' × '+c.width.toFixed(1)+' m · RMS '+c.rms.toFixed(2)+' m · '+(c.schemaVersion>=2?'max residual '+c.maxResidualM.toFixed(2):'D check '+c.checkDMetres.toFixed(2))+' m · '+(c.uncertaintyStatus==='unknown'?'map positioning accuracy unknown':'anchor uncertainty ±'+c.uncertaintyM+' m')+'. Map/GPS bias is not excluded.'+(c.validationStatus==='APPROXIMATE'?' '+c.warnings.join(' '):'');
    $('fieldStatus').classList.toggle('field-calibration-warning',c.validationStatus==='APPROXIMATE');
    $('fieldQuality').textContent='Data quality: approximate / client validated · valid GPS points: '+model.points.length+' · missing intervals: '+model.gaps.length+' (including recording pauses and no-data time) · excluded fixes: '+model.invalid+' · off-field points: '+model.outsideCount+(model.accuracy?' · accuracy ±'+Math.round(model.accuracy.min)+'–'+Math.round(model.accuracy.max)+' m':' · accuracy unavailable')+(model.legacy?' · legacy moving-only route; stationary time cannot be reconstructed.':'');
    if(!model.points.length){$('fieldStatus').textContent+=' No valid GPS data for replay.';$('fieldHeadline').textContent+=' · No GPS points — field preview only';}
    $('fieldCanvasPanel').hidden=false;$('fieldSvg').hidden=false;$('fieldPlay').disabled=!model.points.length||model.durationMs<=0;$('fieldTimeline').disabled=!model.points.length||model.durationMs<=0;
    const image=$('fieldBackground');image.setAttribute('href',G.profiles[c.sport].asset);
    $('fieldPaths').replaceChildren();
    const analytics=G.analyzeReplay(model);model.analytics=analytics;const byIndex=new Map(analytics.segments.map(v=>[v.index,v]));
    $('fieldAnalytics').replaceChildren();
    const note=document.createElement('p');note.textContent='Phone GPS estimates · 3–6 s smoothing · '+analytics.analysedSeconds.toFixed(0)+' s analysed · '+analytics.excludedSeconds.toFixed(0)+' s unclassified · '+analytics.gapSeconds.toFixed(0)+' s gaps. Grey = uncertain. Zone totals describe analysed GPS samples, not the engine distance.';$('fieldAnalytics').appendChild(note);
    for(const z of analytics.zones){const row=document.createElement('p');row.style.borderLeft='4px solid '+z.color;row.style.paddingLeft='10px';row.textContent=z.name+' km/h · '+z.seconds.toFixed(0)+' s · '+z.metres.toFixed(0)+' m';$('fieldAnalytics').appendChild(row)}
    const counts=document.createElement('p');counts.textContent='HSR episodes: '+(analytics.analysedSeconds?analytics.hsrCount:'unavailable')+' · Sprints: '+(analytics.analysedSeconds?analytics.sprintCount:'unavailable')+' (continuous ≥2 s; adjacent HSR/Sprint counted separately).';$('fieldAnalytics').appendChild(counts);
    const acc=document.createElement('p');acc.textContent='ACC / DEC: '+analytics.accelerationReason;$('fieldAnalytics').appendChild(acc);
    let path=null,d='';
    function flush(){if(path)path.setAttribute('d',d);}
    model.points.forEach((p,i)=>{
      const segment=byIndex.get(i),color=segment?.color||'#8e939c';
      if(p.newSegment||!path||path.getAttribute('stroke')!==color){flush();path=document.createElementNS(NS,'path');path.setAttribute('vector-effect','non-scaling-stroke');path.setAttribute('stroke',color);$('fieldPaths').appendChild(path);const previous=!p.newSegment&&i>0?model.points[i-1]:p;d='M'+previous.art.x+','+previous.art.y;
        if(previous!==p)G.artworkSegment(previous,p,c).slice(1).forEach(a=>{d+=' L'+a.x+','+a.y});}
      else G.artworkSegment(model.points[i-1],p,c).slice(1).forEach(a=>{d+=' L'+a.x+','+a.y});
    });flush();
    positionMarker('fieldStart',model.points[0]);positionMarker('fieldEnd',model.points.at(-1));
    $('fieldGapBar').replaceChildren();
    model.gaps.forEach(g=>{const span=document.createElement('span');span.style.left=(g.start/model.durationMs*100)+'%';span.style.width=((g.end-g.start)/model.durationMs*100)+'%';$('fieldGapBar').appendChild(span)});
    $('fieldTimeline').max=String(model.durationMs);setView();updateMarker();selectTab(tab);
  }
  $('fieldRouteTab').onclick=()=>selectTab('route');$('fieldReplayTab').onclick=()=>selectTab('field');
  function openCalibration(edit=false,fromHome=false){
    stop();
    if(!root.PACFieldMap){$('fieldCalibrationMessage').textContent='Interactive map unavailable. Check local map resources; GPS replay is unaffected.';return;}
    const selected=edit?records.find(r=>r?.id===$('fieldSaved').value):null;
    root.PACFieldMap.open({record:selected,onSave({name,calibration:input}){
      const result=G.validateCalibration(input);
      if(result.validationStatus==='APPROXIMATE'&&!result.approximateAcknowledged)throw Error('Explicit approximate calibration confirmation required');
      const id='field-'+crypto.randomUUID(),now=new Date().toISOString();
      const record={id,calibrationId:id,name,createdAt:now,updatedAt:now,validationStatus:result.validationStatus||'VALID',quality:result.quality,warnings:result.warnings||[],approximateAcknowledged:!!result.approximateAcknowledged,approximateAcknowledgedAt:result.approximateAcknowledgedAt||null,
        calibrationAccuracy:result.calibrationAccuracy||null,calibration:result,
        ...(selected?{previousCalibrationId:selected.id}:{})};
      saveStore([...records,record],fromHome?bindings:{...bindings,[session.sessionId]:id});
      if(fromHome){localStorage.setItem('pac-gps-preferred-field-v1',id);$('homeRunLocation').value='field';localStorage.setItem('pac-gps-run-location-v1','field');fillHomeFields(id);syncHome();$('homeFieldMessage').textContent='Saved field: '+name+' · ready for your next Running session.';return;}
      calibration=result;fillSaved(id);$('fieldCalibrationMessage').textContent='Field saved locally. Previous calibrations are retained.';tab='field';render();
    }});
  }
  function fillHomeFields(id=localStorage.getItem('pac-gps-preferred-field-v1')||''){
    $('homeFieldSaved').replaceChildren(new Option('Choose field / Виберіть поле',''));
    records.forEach(r=>{try{G.validateCalibration(r.calibration);$('homeFieldSaved').add(new Option(r.name+' · '+r.calibration.sport,r.id))}catch(_){}});$('homeFieldSaved').value=id;
  }
  function syncHome(){const run=document.querySelector('[data-activity="run"]').getAttribute('aria-pressed')==='true';$('homeFieldSetup').hidden=!run;$('homeFieldOptions').hidden=$('homeRunLocation').value!=='field';}
  $('homeRunLocation').value=localStorage.getItem('pac-gps-run-location-v1')==='field'?'field':'route';fillHomeFields();syncHome();
  $('homeRunLocation').onchange=()=>{localStorage.setItem('pac-gps-run-location-v1',$('homeRunLocation').value);$('homeFieldMessage').textContent='';syncHome()};
  $('homeFieldSaved').onchange=()=>{localStorage.setItem('pac-gps-preferred-field-v1',$('homeFieldSaved').value);$('homeFieldMessage').textContent='Field selected for your next Running session.'};
  new MutationObserver(syncHome).observe($('activityGrid'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
  $('btnStart').addEventListener('click',e=>{if(!$('screenHome').hidden&&!$('homeFieldSetup').hidden&&$('homeRunLocation').value==='field'&&!$('homeFieldSaved').value){e.preventDefault();e.stopImmediatePropagation();$('homeFieldMessage').textContent='Choose or calibrate a field before Start / Спочатку виберіть або додайте поле.';$('homeFieldSaved').focus();}},true);
  new MutationObserver(()=>{if(!$('screenHome').hidden||root.PAC?.getState()!=='running')return;const value=root.PAC?.getSession();if(!value?.sessionId||!value.startTime||Object.hasOwn(bindings,value.sessionId))return;const id=value.activityType==='run'&&$('homeRunLocation').value==='field'?$('homeFieldSaved').value:null;try{saveStore(records,{...bindings,[value.sessionId]:id||null})}catch(_){$('homeFieldMessage').textContent='Field selection could not be saved locally.'}}).observe($('screenHome'),{attributes:true,attributeFilter:['hidden']});
  $('homeAddField').onclick=()=>openCalibration(false,true);
  $('fieldCalibrate').onclick=()=>openCalibration();
  $('fieldRecalibrate').onclick=()=>openCalibration(true);
  $('fieldSaved').onchange=()=>{
    stop();const r=records.find(r=>r?.id===$('fieldSaved').value);
    try{
      const next=r?G.validateCalibration(r.calibration):null;
      saveStore(records,{...bindings,[session.sessionId]:r?r.id:null});calibration=next;render();
    }catch(_){$('fieldStatus').textContent='Cannot apply/save this field. Check local storage and recalibrate.';}
  };
  $('fieldTimeline').oninput=()=>{stop();time=Number($('fieldTimeline').value);updateMarker();};
  function tick(now){if(!playing||!model)return;time=Math.min(model.durationMs,startTime+(now-started)*Number($('fieldRate').value));updateMarker();if(time>=model.durationMs)stop();else frame=requestAnimationFrame(tick);}
  $('fieldRate').onchange=stop;
  $('fieldPlay').onclick=()=>{if(playing){stop();return}if(!model||!model.points.length)return;if(time>=model.durationMs)time=0;startTime=time;started=performance.now();playing=true;$('fieldPlay').textContent='Pause';frame=requestAnimationFrame(tick);};
  $('fieldZoomIn').onclick=()=>{zoom=Math.min(4,zoom*1.4);setView()};$('fieldZoomOut').onclick=()=>{zoom=Math.max(1,zoom/1.4);setView()};$('fieldFit').onclick=()=>{fieldOnly=false;zoom=1;pan={x:0,y:0};setView()};
  $('fieldFocus').onclick=()=>{fieldOnly=true;zoom=1;pan={x:0,y:0};setView()};
  function exitFieldScreen(){fieldStage.classList.remove('is-expanded');document.body.classList.remove('field-screen-open');$('fieldExpand').textContent='⛶ Full screen';requestAnimationFrame(setView)}
  $('fieldExpand').onclick=()=>{const expanded=fieldStage.classList.toggle('is-expanded');document.body.classList.toggle('field-screen-open',expanded);$('fieldExpand').textContent=expanded?'× Close':'⛶ Full screen';requestAnimationFrame(setView)};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')exitFieldScreen()});
  new ResizeObserver(()=>setView()).observe(fieldStage);
  let drag=null;const svg=$('fieldSvg');
  svg.addEventListener('pointerdown',e=>{svg.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,pan:{...pan}}});
  svg.addEventListener('pointermove',e=>{if(!drag||!model)return;const matrix=svg.getScreenCTM();if(!matrix)return;const dx=(e.clientX-drag.x)/matrix.a,dy=(e.clientY-drag.y)/matrix.d;pan=portrait()?{x:drag.pan.x-dy,y:drag.pan.y+dx}:{x:drag.pan.x-dx,y:drag.pan.y-dy};setView()});
  const endDrag=()=>{drag=null};svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
  $('fieldBackground').addEventListener('error',()=>{$('fieldStatus').textContent='Field artwork failed to load. Check the publication assets; use GPS route preview.';selectTab('route')});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  root.PACFieldReplay={
    show(value){stop();
      // Read only the finished replay snapshot; never duplicate raw/debug GPS fixes.
      session={totalDistance:value.totalDistance,maxSpeed:value.maxSpeed,sessionId:value.sessionId,startTimestamp:value.startTimestamp,endTimestamp:value.endTimestamp,
        startTime:value.startTime,endTime:value.endTime,replaySchemaVersion:value.replaySchemaVersion,
        replayPoints:value.replayPoints,route:value.route};
      host.hidden=value.activityType!=='run';if(host.hidden)return;
      const chosen=bindings[session.sessionId];const r=records.find(r=>r?.id===chosen);calibration=null;
      if(r){try{calibration=G.validateCalibration(r.calibration)}catch(_){}}
      fillSaved(r?r.id:'');tab=calibration?'field':'route';render();
    },
    hide(){stop();exitFieldScreen();if(root.PACFieldMap)root.PACFieldMap.close();host.hidden=true;}
  };
})(window);
