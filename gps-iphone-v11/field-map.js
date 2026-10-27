/* Embedded corner editor only. GPS watcher, session lifecycle and Field Replay
 * never depend on this view or its public test providers. Leaflet is vendored. */
(function(root){
  'use strict';
  const G=root.PACFieldGeometry,$=id=>document.getElementById(id);
  const config=root.PACMapProviders;
  const panel=document.createElement('section');panel.id='fieldMapView';panel.className='field-map-view';panel.hidden=true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','mapTitle');
  panel.innerHTML=`
    <header class="map-header"><button type="button" id="mapBack" class="btn btn-outline">← Back</button><div><strong id="mapTitle">Calibrate field</strong><small>Choose the playing area</small></div></header>
    <form id="mapSearchForm" class="map-search" role="search"><label class="sr-only" for="mapSearch">Stadium name or address</label><input id="mapSearch" type="search" maxlength="160" placeholder="Stadium or address, city" autocomplete="off"><button id="mapSearchButton" class="btn btn-gold" type="submit">Search</button></form>
    <div id="mapSearchResults" class="map-search-results" aria-live="polite" hidden></div>
    <div class="map-tools"><label class="sr-only" for="mapSport">Sport</label><select id="mapSport"><option value="football">Football</option><option value="rugby">Rugby</option></select><button id="mapLocate" class="btn btn-outline" type="button">My location</button><button id="mapRetryTiles" class="btn btn-outline" type="button" hidden>Retry map</button></div>
    <p id="mapStep" class="map-step" aria-live="polite">Find your field, zoom in, then tap corner A.</p>
    <div id="calibrationMap" aria-label="Geographic map. Tap four playing-area corners A B C D in boundary order."></div>
    <div class="map-bottom">
      <div class="map-corner-actions"><button id="mapUndo" class="btn btn-outline" type="button">Undo point</button><button id="mapReset" class="btn btn-outline" type="button">Reset corners</button><span id="mapCornerCount">0 / 4</span></div>
      <label class="field-label">Selected boundary <select id="mapSelectionMode"><option value="area">Movement area — markings unknown</option><option value="pitch">Known pitch boundaries</option></select></label><details id="mapOptions"><summary>Field options</summary><div class="map-options-grid">
        <label class="field-label">Profile <select id="mapVariant"><option value="standard">Full-size field</option><option value="training">Modified / training</option></select></label>
        <label id="mapExtentLabel" class="field-label" hidden>Rugby boundary <select id="mapExtent"><option value="goal-lines">Between goal lines</option><option value="full-area">Full area with in-goals</option></select></label>
        <label id="mapInGoalStartLabel" class="field-label" hidden>In-goal at start of long axis (m)<input id="mapInGoalStart" type="number" min="1" max="30" step=".1" placeholder="Actual depth"></label>
        <label id="mapInGoalEndLabel" class="field-label" hidden>In-goal at end of long axis (m)<input id="mapInGoalEnd" type="number" min="1" max="30" step=".1" placeholder="Actual depth"></label>
      </div></details>
      <div id="mapReview" class="map-review" hidden>
        <svg id="mapAlignment" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Schematic alignment with ProAthleteCare field"><image id="mapAlignmentImage" width="1536" height="1024"/><path id="mapAlignmentOutline" fill="none" stroke="#ffc72c" stroke-width="8"/></svg>
        <div><strong id="mapMeasurements"></strong><p id="mapAlignmentNote">Schematic artwork · map accuracy unknown</p></div>
      </div>
      <div id="mapSideMetrics" class="map-side-metrics" hidden>
        <div class="map-side-grid"><span>AB <strong id="mapSideAB"></strong></span><span>BC <strong id="mapSideBC"></strong></span><span>CD <strong id="mapSideCD"></strong></span><span>DA <strong id="mapSideDA"></strong></span></div>
        <p id="mapLengthDifference"></p><p id="mapWidthDifference"></p>
      </div>
      <p id="mapValidation" role="status"></p>
      <div id="mapSaveArea" hidden><label class="sr-only" for="mapFieldName">Field name</label><input id="mapFieldName" maxlength="60" placeholder="Name this field" autocomplete="off" enterkeyhint="done"><label class="map-confirm"><input id="mapReviewConfirmed" type="checkbox"> I checked the playing boundary and alignment.</label><label id="mapApproximateConfirmLabel" class="map-confirm map-approximate-confirm" hidden><input id="mapApproximateConfirmed" type="checkbox"> I confirm the boundary type and accept APPROXIMATE calibration. The GPS trajectory on this field will be indicative, not exact.</label><p id="mapSaveHint" role="status"></p><button id="mapSave" class="btn btn-gold btn-block" type="button" disabled>Save field</button></div>
      <p id="mapNetworkStatus" role="status"></p>
      <p class="map-provider-note">Test map: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> · search: Photon. Visible map tiles and typed searches reach these providers; GPS routes never do. Online service is not guaranteed.</p>
    </div>`;
  document.body.appendChild(panel);
  let resizeObserver=null,map=null,tiles=null,markers=[],outline=null,locationLayer=null,corners=[],draft=null,saveCallback=null,returnFocus=null;
  let searchController=null,searchGeneration=0,lastSearchAt=0,locating=false,locateGeneration=0,saving=false;
  let cache=Object.create(null);try{Object.assign(cache,JSON.parse(localStorage.getItem('pac-gps-map-search-v1')||'{}')||{})}catch(_){}
  const letters=['A','B','C','D'];
  function message(text){$('mapNetworkStatus').textContent=text;}
  function syncOptions(){
    const rugby=$('mapSport').value==='rugby',area=$('mapSelectionMode').value==='area',full=!area&&rugby&&$('mapExtent').value==='full-area';
    $('mapExtentLabel').hidden=!rugby||area;$('mapVariant').parentElement.hidden=area;$('mapInGoalStartLabel').hidden=!full;$('mapInGoalEndLabel').hidden=!full;
  }
  function updateSave(){
    $('mapSaveHint').textContent=!draft?'Review the boundary validation above.':!$('mapFieldName').value.trim()?'Enter a field name to save.':!$('mapReviewConfirmed').checked?'Confirm that you checked the selected boundary.':draft.validationStatus==='APPROXIMATE'&&!$('mapApproximateConfirmed').checked?'Accept APPROXIMATE calibration to enable Save field.':'Ready to save locally.';
    $('mapSave').disabled=saving||!draft||!$('mapFieldName').value.trim()||!$('mapReviewConfirmed').checked||(draft?.validationStatus==='APPROXIMATE'&&!$('mapApproximateConfirmed').checked);
  }
  function validate(){
    draft=null;$('mapReviewConfirmed').checked=false;$('mapApproximateConfirmed').checked=false;
    $('mapApproximateConfirmLabel').hidden=true;$('mapReview').hidden=true;$('mapSideMetrics').hidden=true;
    $('mapSaveArea').hidden=corners.length!==4;$('mapCornerCount').textContent=corners.length+' / 4';
    $('mapUndo').disabled=corners.length===0;$('mapReset').disabled=corners.length===0;
    const rugby=$('mapSport').value==='rugby',area=$('mapSelectionMode').value==='area',full=!area&&rugby&&$('mapExtent').value==='full-area';
    const instructions=['Tap A at the first playing-area corner.','Tap B at the next boundary corner (either side).','Tap C at the next boundary corner.','Tap D to complete the boundary.'];
    $('mapStep').textContent=corners.length<4?instructions[corners.length]+(area?' Select the movement area; internal pitch lines will remain unknown.':rugby?(full?' Use dead-ball boundaries; enter actual in-goals in Field options.':' Use goal-line / touchline corners, not dead-ball lines.'):' Select pitch corners, not the stadium complex.'):'Review measured sides and quality. No corners are moved automatically.';
    $('mapValidation').textContent='';delete $('mapValidation').dataset.quality;
    if(corners.length===4){
      const result=G.assessPolygon({sport:$('mapSport').value,corners,variant:$('mapVariant').value,selectionMode:$('mapSelectionMode').value,extent:!area&&rugby?$('mapExtent').value:'goal-lines',inGoal:{start:Number($('mapInGoalStart').value),end:Number($('mapInGoalEnd').value)}});
      const measured=result.measurements,format=n=>Number.isFinite(n)?n.toFixed(1):'—';
      $('mapReview').hidden=false;$('mapAlignmentImage').setAttribute('href',G.profiles[$('mapSport').value].asset);
      $('mapAlignment').setAttribute('viewBox','0 0 1536 1024');$('mapAlignmentOutline').setAttribute('d','');
      $('mapMeasurements').textContent=(rugby?'Rugby':'Football')+' reference'+(measured?' · selected outline ≈'+format(measured.totalLengthM)+' × '+format(measured.widthM)+' m':'');
      $('mapAlignmentNote').textContent='Schematic reference only · calibration not validated';
      if(measured){
        $('mapSideMetrics').hidden=false;
        ['AB','BC','CD','DA'].forEach((name,i)=>$('mapSide'+name).textContent=format(measured.sideLengthsM[i])+' m');
        const difference=(label,d)=>label+': Δ '+format(d.metres)+' m ('+format(d.percent)+'%, relative to the pair mean)';
        $('mapLengthDifference').textContent=difference('AB ↔ CD',measured.oppositeDifferences.length);
        $('mapWidthDifference').textContent=difference('BC ↔ DA',measured.oppositeDifferences.width);
      }
      $('mapValidation').dataset.quality=result.status;
      if(result.status==='INVALID')$('mapValidation').textContent='INVALID · '+result.errors.join(' ');
      else{
        draft=result.calibration;const d=draft.measuredDimensions;
        const axis=draft.axisCornerOrder||[0,1,2,3];$('mapInGoalStartLabel').firstChild.textContent='In-goal at '+letters[axis[0]]+'–'+letters[axis[3]]+' (m)';$('mapInGoalEndLabel').firstChild.textContent='In-goal at '+letters[axis[1]]+'–'+letters[axis[2]]+' (m)';
        $('mapApproximateConfirmLabel').hidden=result.status!=='APPROXIMATE';
        $('mapMeasurements').textContent=(rugby?'Rugby':'Football')+' · ≈'+format(d.lengthM)+' × '+format(d.widthM)+' m · '+Math.round(full?d.fieldAreaM2:d.polygonAreaM2)+' m² · '+d.bearingDegrees.toFixed(0)+'° from north';
        $('mapAlignmentNote').textContent=(result.status==='APPROXIMATE'?'APPROXIMATE — indicative replay · ':'VALID geometry · ')+(full?'full outline '+format(d.totalLengthM)+' m; in-goals '+draft.inGoal.start+' / '+draft.inGoal.end+' m · ':'')+(area?'movement area; pitch markings unknown; ':'')+'schematic artwork; map accuracy unknown';
        $('mapValidation').textContent=result.status+' · Geometry checked · RMS '+draft.rms.toFixed(2)+' m, maximum residual '+draft.maxResidualM.toFixed(2)+' m. '+result.warnings.join(' ');
        const points=corners.map(c=>({art:G.fieldToArtwork(G.toField(c,draft),draft)}));
        $('mapAlignmentOutline').setAttribute('d',points.map((p,i)=>(i?'L':'M')+p.art.x+','+p.art.y).join(' ')+' Z');
        const box=G.viewport(points);$('mapAlignment').setAttribute('viewBox',[box.x,box.y,box.width,box.height].join(' '));
      }
    }
    updateSave();
  }
  function refresh(rebuild=true){
    if(!map)return;
    if(outline)outline.remove();
    const latlngs=corners.map(p=>[p.lat,p.lng]);
    outline=(corners.length===4?L.polygon(latlngs,{color:'#ffc72c',weight:3,fillOpacity:.12,interactive:false}):L.polyline(latlngs,{color:'#ffc72c',weight:3,interactive:false})).addTo(map);
    if(rebuild){
      markers.forEach(m=>m.remove());markers=[];
      corners.forEach((point,i)=>{
        const icon=L.divIcon({className:'map-corner',html:'<span>'+letters[i]+'</span>',iconSize:[44,44],iconAnchor:[22,22]});
        const marker=L.marker([point.lat,point.lng],{icon,draggable:true,autoPan:true,autoPanPadding:[30,30],title:'Drag corner '+letters[i],alt:'Corner '+letters[i]}).addTo(map);
        marker.on('drag',()=>{const p=marker.getLatLng();corners[i]={lat:p.lat,lng:p.lng};refresh(false)});
        marker.on('dragend',()=>refresh(false));markers.push(marker);
      });
    }
    validate();
  }
  function addTiles(){
    if(!map||!config)return;
    if(tiles)tiles.remove();
    tiles=L.tileLayer(config.tileUrl,{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',maxZoom:22,maxNativeZoom:config.tileMaxZoom,keepBuffer:1,updateWhenIdle:true,referrerPolicy:'strict-origin-when-cross-origin'});
    tiles.on('tileerror',()=>{if(panel.hidden)return;message('Map tiles unavailable. Your corners remain; retry when online or go Back. GPS recording and local replay are unaffected.');$('mapRetryTiles').hidden=false;});
    tiles.addTo(map);
  }
  function fitViewport(){
    const height=root.visualViewport?.height||root.innerHeight;panel.style.height=height+'px';panel.style.setProperty('--map-viewport-height',height+'px');
    if(map)map.invalidateSize({pan:false});
  }
  function close(){
    root.visualViewport?.removeEventListener('resize',fitViewport);root.removeEventListener('resize',fitViewport);
    searchGeneration++;locateGeneration++;if(searchController)searchController.abort();searchController=null;locating=false;
    if(resizeObserver){resizeObserver.disconnect();resizeObserver=null;}
    if(map){map.remove();map=null;tiles=null;outline=null;markers=[];locationLayer=null;}
    panel.hidden=true;saving=false;document.body.classList.remove('field-map-open');
    const app=document.querySelector('.app');if(app)app.inert=false;
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  }
  async function search(event){
    event.preventDefault();const query=$('mapSearch').value.trim();
    if(query.length<3){message('Enter at least 3 characters: stadium name or address and city.');return;}
    const key=query.toLowerCase(),cached=cache[key];
    function show(results){
      const host=$('mapSearchResults');host.replaceChildren();host.hidden=false;
      if(!results.length){host.textContent='No results. Try another name, address or city; you can pan the map manually.';return;}
      results.forEach(result=>{
        const button=document.createElement('button');button.type='button';button.textContent=result.label;
        button.onclick=()=>{if(!map)return;$('mapSearch').blur();map.setView([result.lat,result.lng],18,{animate:true});host.hidden=true;if(!$('mapFieldName').value)$('mapFieldName').value=result.label.slice(0,60);message('Search result selected. Zoom and select the actual playing-area corners; search does not define a field.');};host.appendChild(button);
      });
    }
    if(cached&&Array.isArray(cached.results)&&cached.results.every(r=>typeof r.label==='string'&&G.coordinate(r))&&Number.isFinite(cached.at)&&Date.now()-cached.at<7*24*60*60*1000){show(cached.results);return;}
    if(!navigator.onLine){message('Search is offline. Use a saved field or return when online.');return;}
    if(Date.now()-lastSearchAt<config.searchIntervalMs){message('Please wait a moment before searching again.');return;}
    if(searchController)return;
    lastSearchAt=Date.now();searchController=new AbortController();const controller=searchController,generation=++searchGeneration;
    const timeout=setTimeout(()=>controller.abort(),config.searchTimeoutMs);$('mapSearchButton').disabled=true;message('Searching…');
    try{
      const url=new URL(config.geocoderUrl);url.searchParams.set('q',query);url.searchParams.set('limit','5');
      // No route, device position, corners, geographic bias, or credentials sent.
      const response=await fetch(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'strict-origin-when-cross-origin'});
      if(!response.ok)throw Error('service');const json=await response.json();
      if(!Array.isArray(json.features))throw Error('response');
      const results=json.features.slice(0,5).filter(f=>f.geometry?.type==='Point'&&G.coordinate({lat:f.geometry.coordinates?.[1],lng:f.geometry.coordinates?.[0]})).map(f=>{
        const p=f.properties||{},label=[p.name,p.street,p.housenumber,p.postcode,p.city||p.town||p.district,p.country].filter(v=>typeof v==='string').join(', ').slice(0,300);
        return {label:label||'Unnamed search result',lat:f.geometry.coordinates[1],lng:f.geometry.coordinates[0]};
      });
      if(generation!==searchGeneration||panel.hidden)return;
      cache[key]={at:Date.now(),results};const keys=Object.keys(cache).sort((a,b)=>cache[b].at-cache[a].at);cache=Object.fromEntries(keys.slice(0,20).map(k=>[k,cache[k]]));
      try{localStorage.setItem('pac-gps-map-search-v1',JSON.stringify(cache))}catch(_){}
      show(results);message('Search: Photon / OpenStreetMap data. Select a result, then mark your own corners.');
    }catch(_){if(generation===searchGeneration&&!panel.hidden)message('Search unavailable or timed out. Retry later, pan manually, or use a saved field. No field was created.');}
    finally{clearTimeout(timeout);if(searchController===controller)searchController=null;$('mapSearchButton').disabled=false;}
  }
  $('mapBack').onclick=close;$('mapSearchForm').onsubmit=search;
  $('mapUndo').onclick=()=>{corners.pop();refresh()};$('mapReset').onclick=()=>{corners=[];refresh()};
  ['mapSelectionMode','mapSport','mapVariant','mapExtent','mapInGoalStart','mapInGoalEnd'].forEach(id=>$(id).addEventListener('change',()=>{syncOptions();validate();if(map)setTimeout(()=>map?.invalidateSize(),0)}));
  $('mapFieldName').oninput=updateSave;$('mapFieldName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.target.blur()}});$('mapReviewConfirmed').onchange=updateSave;$('mapApproximateConfirmed').onchange=updateSave;$('mapRetryTiles').onclick=()=>{message('Retrying online map…');addTiles();};
  $('mapLocate').onclick=()=>{
    if(locating)return;if(!navigator.geolocation){message('Location is not supported. Search or pan manually.');return;}
    locating=true;const generation=++locateGeneration;$('mapLocate').disabled=true;message('Requesting your current position…');
    navigator.geolocation.getCurrentPosition(p=>{
      if(generation!==locateGeneration||!map)return;locating=false;$('mapLocate').disabled=false;
      const point={lat:p.coords.latitude,lng:p.coords.longitude};if(!G.coordinate(point)){message('Position unavailable. Search or pan manually.');return;}
      if(locationLayer)locationLayer.remove();locationLayer=L.featureGroup([L.circleMarker([point.lat,point.lng],{radius:7,color:'#fff',fillColor:'#38bdf8',fillOpacity:1}),L.circle([point.lat,point.lng],{radius:Number.isFinite(p.coords.accuracy)?p.coords.accuracy:0,color:'#38bdf8',fillOpacity:.1})]).addTo(map);
      map.setView([point.lat,point.lng],18);message('Current position shown'+(Number.isFinite(p.coords.accuracy)?' · accuracy ±'+Math.round(p.coords.accuracy)+' m':'')+'. This is not a field corner; select the playing boundary yourself.');
    },()=>{if(generation!==locateGeneration)return;locating=false;$('mapLocate').disabled=false;message('Location permission denied or position unavailable. Search or pan manually.');},{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
  };
  $('mapSave').onclick=async()=>{
    if(saving||!draft||!$('mapReviewConfirmed').checked||!$('mapFieldName').value.trim()||(draft.validationStatus==='APPROXIMATE'&&!$('mapApproximateConfirmed').checked))return;
    try{
      saving=true;updateSave();
      const validated=G.validateCalibration({...draft,approximateAcknowledged:draft.validationStatus==='APPROXIMATE',approximateAcknowledgedAt:draft.validationStatus==='APPROXIMATE'?new Date().toISOString():null});
      await saveCallback({name:$('mapFieldName').value.trim(),calibration:validated});close();
    }catch(_){saving=false;updateSave();$('mapValidation').textContent='Field could not be saved. Check local storage, review corners and try again. Previous calibrations are unchanged.';}
  };
  panel.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){
      const nodes=[...panel.querySelectorAll('button,input,select,summary,a[href],[tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);
      if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  root.PACFieldMap={
    open({record=null,onSave}){
      if(!panel.hidden)close();returnFocus=document.activeElement;saveCallback=onSave;draft=null;corners=[];saving=false;
      $('mapFieldName').value=record?.name||'';$('mapSearch').value='';$('mapSearchResults').hidden=true;$('mapSearchResults').replaceChildren();
      $('mapOptions').open=false;$('mapSport').value=record?.calibration?.sport||'football';$('mapVariant').value=record?.calibration?.variant||'standard';
      $('mapSelectionMode').value=record?.calibration?.selectionMode|| (record?'pitch':'area');$('mapExtent').value=record?.calibration?.extent||'goal-lines';$('mapInGoalStart').value=record?.calibration?.inGoal?.start||'';$('mapInGoalEnd').value=record?.calibration?.inGoal?.end||'';
      if(record){try{const c=G.validateCalibration(record.calibration);corners=(c.geoCorners||[c.anchors[0],c.anchors[1],c.anchors[3],c.anchors[2]]).map(p=>({...p}));}catch(_){}}
      panel.hidden=false;document.body.classList.add('field-map-open');
      const app=document.querySelector('.app');if(app)app.inert=true;fitViewport();root.visualViewport?.addEventListener('resize',fitViewport);root.addEventListener('resize',fitViewport);syncOptions();message('Online map uses OSM tiles and Photon search. No GPS route is sent.');$('mapLocate').disabled=false;$('mapSearchButton').disabled=false;$('mapRetryTiles').hidden=true;
      if(!root.L||!config){$('mapSearchButton').disabled=true;$('mapLocate').disabled=true;$('mapValidation').textContent='Map resources are unavailable. Go Back; local GPS recording/replay still work.';$('mapBack').focus();return;}
      map=L.map('calibrationMap',{zoomControl:true,maxZoom:22,minZoom:2,worldCopyJump:true,doubleClickZoom:false,tapTolerance:12,scrollWheelZoom:true,touchZoom:true,zoomSnap:.5,attributionControl:true});
      if(corners.length)map.fitBounds(corners.map(p=>[p.lat,p.lng]),{padding:[45,45],maxZoom:20});else map.setView([20,0],2);
      map.on('click',e=>{if(corners.length===4){message('Four corners selected. Drag a marker, Undo the last point or Reset.');return;}const point={lat:e.latlng.lat,lng:((e.latlng.lng+540)%360)-180};if(G.coordinate(point)){corners.push(point);refresh();if(corners.length===4){map.invalidateSize({pan:false});map.fitBounds(corners.map(p=>[p.lat,p.lng]),{padding:[32,32],maxZoom:20,animate:false});}}});
      addTiles();refresh();map.invalidateSize();if(corners.length===4)map.fitBounds(corners.map(p=>[p.lat,p.lng]),{padding:[32,32],maxZoom:20,animate:false});
      if(root.ResizeObserver){resizeObserver=new ResizeObserver(()=>map?.invalidateSize({pan:false}));resizeObserver.observe($('calibrationMap'));}
      $('mapBack').focus();
    },close,getMap(){return map;}
  };
})(window);
