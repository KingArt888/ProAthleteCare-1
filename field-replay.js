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
      <p class="field-muted">Actual phone GPS · approximate positions. Neutral gold shows actual data, not planned drills or validated speed zones.</p>
      <label class="field-label">Saved field <select id="fieldSaved"><option value="">Choose a calibrated field</option></select></label>
      <p id="fieldStatus" role="status"></p>
      <div class="field-calibrate-actions"><button id="fieldCalibrate" class="btn btn-gold" type="button">Calibrate field</button><button id="fieldRecalibrate" class="btn btn-outline" type="button" disabled>Recalibrate selected</button></div>
      <p id="fieldCalibrationMessage" role="status"></p>
      <div id="fieldCanvasPanel" hidden>
        <p class="field-muted">Schematic field · actual GPS only. Drag to pan; Fit includes off-field points.</p>
        <div class="field-zoom" role="group" aria-label="Field zoom">
          <button type="button" class="btn btn-outline" id="fieldZoomOut" aria-label="Zoom out">−</button>
          <button type="button" class="btn btn-outline" id="fieldZoomIn" aria-label="Zoom in">+</button>
          <button type="button" class="btn btn-outline" id="fieldFit">Fit all</button>
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
        <div class="field-play-controls"><button type="button" class="btn btn-gold" id="fieldPlay">Play</button><output id="fieldTime">0:00</output></div>
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
    tab=next;stop();$('screenSummary').classList.toggle('field-focused',next==='field');$('fieldReplayPanel').hidden=next!=='field';
    $('fieldRouteTab').setAttribute('aria-pressed',String(next==='route'));
    $('fieldReplayTab').setAttribute('aria-pressed',String(next==='field'));
    $('gpsRoutePanel').hidden=next==='field' && !!model;
    if(next==='field' && model)updateMarker();
  }
  function setView(){
    if(!model)return;
    const v=G.viewport(model.points,zoom);$('fieldSvg').setAttribute('viewBox',[v.x+pan.x,v.y+pan.y,v.width,v.height].join(' '));
  }
  function clock(ms){const sec=Math.floor(ms/1000);return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
  function updateMarker(){
    if(!model)return;
    const p=G.sampleAt(model,time);$('fieldMarker').style.display=p?'':'none';
    if(p){$('fieldMarker').setAttribute('cx',p.art.x);$('fieldMarker').setAttribute('cy',p.art.y);}
    $('fieldTimeline').value=String(time);$('fieldTime').value=clock(time)+' / '+clock(model.durationMs);
    $('fieldMarkerStatus').textContent=p?('GPS accuracy ±'+Math.round(p.accuracy)+' m · '+(p.interpolated?'visual interpolation between valid fixes':'recorded fix')):'No GPS position at this time · gap / recording pause / no data';
  }
  function positionMarker(id,p){const node=$(id);node.style.display=p?'':'none';if(p){node.setAttribute('cx',p.art.x);node.setAttribute('cy',p.art.y);}}
  function render(){
    stop();model=null;$('fieldStatus').classList.remove('field-calibration-warning');$('fieldCanvasPanel').hidden=true;time=0;zoom=1;pan={x:0,y:0};
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
    let path=null,d='';
    function flush(){if(path)path.setAttribute('d',d);}
    model.points.forEach((p,i)=>{
      if(p.newSegment||!path){flush();path=document.createElementNS(NS,'path');path.setAttribute('vector-effect','non-scaling-stroke');$('fieldPaths').appendChild(path);d='M'+p.art.x+','+p.art.y;}
      else G.artworkSegment(model.points[i-1],p,c).slice(1).forEach(a=>{d+=' L'+a.x+','+a.y});
    });flush();
    positionMarker('fieldStart',model.points[0]);positionMarker('fieldEnd',model.points.at(-1));
    $('fieldGapBar').replaceChildren();
    model.gaps.forEach(g=>{const span=document.createElement('span');span.style.left=(g.start/model.durationMs*100)+'%';span.style.width=((g.end-g.start)/model.durationMs*100)+'%';$('fieldGapBar').appendChild(span)});
    $('fieldTimeline').max=String(model.durationMs);setView();updateMarker();selectTab(tab);
  }
  $('fieldRouteTab').onclick=()=>selectTab('route');$('fieldReplayTab').onclick=()=>selectTab('field');
  function openCalibration(edit=false){
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
      saveStore([...records,record],{...bindings,[session.sessionId]:id});
      calibration=result;fillSaved(id);$('fieldCalibrationMessage').textContent='Field saved locally. Previous calibrations are retained.';tab='field';render();
    }});
  }
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
  function tick(now){if(!playing||!model)return;time=Math.min(model.durationMs,startTime+now-started);updateMarker();if(time>=model.durationMs)stop();else frame=requestAnimationFrame(tick);}
  $('fieldPlay').onclick=()=>{if(playing){stop();return}if(!model||!model.points.length)return;if(time>=model.durationMs)time=0;startTime=time;started=performance.now();playing=true;$('fieldPlay').textContent='Pause';frame=requestAnimationFrame(tick);};
  $('fieldZoomIn').onclick=()=>{zoom=Math.min(4,zoom*1.4);setView()};$('fieldZoomOut').onclick=()=>{zoom=Math.max(1,zoom/1.4);setView()};$('fieldFit').onclick=()=>{zoom=1;pan={x:0,y:0};setView()};
  let drag=null;const svg=$('fieldSvg');
  svg.addEventListener('pointerdown',e=>{svg.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,pan:{...pan}}});
  svg.addEventListener('pointermove',e=>{if(!drag||!model)return;const matrix=svg.getScreenCTM();if(!matrix)return;pan={x:drag.pan.x-(e.clientX-drag.x)/matrix.a,y:drag.pan.y-(e.clientY-drag.y)/matrix.d};setView()});
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
      const r=records.find(r=>r?.id===bindings[session.sessionId]);calibration=null;
      if(r){try{calibration=G.validateCalibration(r.calibration)}catch(_){}}
      fillSaved(r?r.id:'');tab='route';render();
    },
    hide(){stop();if(root.PACFieldMap)root.PACFieldMap.close();host.hidden=true;}
  };
})(window);
