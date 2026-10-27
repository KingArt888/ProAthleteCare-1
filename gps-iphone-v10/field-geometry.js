/* Independent GPS→field geometry. No DOM, storage, network or editor state.
 * WGS84 ellipsoid → ECEF → local ENU, common h=0 reference (not measured altitude).
 * ENU rotation: ESA Navipedia, Transformations between ECEF and ENU coordinates.
 * Artwork control lines: js/drill-canvas-editor.js FIELD_PROFILES (2026-10-27).
 * Artwork is schematic: geographic/world metres never come from screen pixels.
 */
(function(root) {
  'use strict';
  const RAD = Math.PI / 180, A = 6378137, E2 = 6.6943799901413165e-3;
  const profiles = {
    football: {length:105,width:68,asset:'assets/field-football.png',templateId:'proathletecare_stadium_v1',
      x:[[.0947265625,0],[.13053385416666666,5.5],[.20475260416666666,16.5],[.4990234375,52.5],[.7900390625,88.5],[.8665364583333334,99.5],[.9046223958333334,105]],
      y:[[.13623046875,0],[.26123046875,13.84],[.36865234375,24.84],[.476318359375,34],[.56298828125,43.16],[.67431640625,54.16],[.81640625,68]]},
    rugby: {length:100,width:70,asset:'assets/field-rugby.png',templateId:'proathletecare_rugby_v1',
      x:[[.151,0],[.1868,5],[.3047,22],[.4303,40],[.5,50],[.5697,60],[.6953,78],[.8132,95],[.8483,100]],
      y:[[.1465,0],[.209,5],[.303,15],[.48825,35],[.676,55],[.7695,65],[.83,70]]}
  };
  // Prevent external code changing calibration geometry after validation.
  function freeze(o){Object.values(o).forEach(v=>{if(v && typeof v==='object')freeze(v)});return Object.freeze(o)}
  freeze(profiles);
  function coordinate(p) {
    return p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat)<=90 && Math.abs(p.lng)<=180;
  }
  function ecef(p) {
    if(!coordinate(p))throw Error('Invalid WGS84 latitude/longitude');
    const lat=p.lat*RAD,lon=p.lng*RAD,n=A/Math.sqrt(1-E2*Math.sin(lat)**2);
    return {x:n*Math.cos(lat)*Math.cos(lon),y:n*Math.cos(lat)*Math.sin(lon),z:n*(1-E2)*Math.sin(lat)};
  }
  function localMeters(p,origin) {
    const q=ecef(p),o=ecef(origin),lat=origin.lat*RAD,lon=origin.lng*RAD;
    const x=q.x-o.x,y=q.y-o.y,z=q.z-o.z;
    return {e:-Math.sin(lon)*x+Math.cos(lon)*y,
      n:-Math.sin(lat)*Math.cos(lon)*x-Math.sin(lat)*Math.sin(lon)*y+Math.cos(lat)*z};
  }
  function fitCalibration(input) {
    if(!input || !Object.hasOwn(profiles,input.sport))throw Error('Choose football or rugby');
    const {sport,length,width,anchors,uncertaintyM}=input;
    if(!Number.isFinite(length)||length<20||length>200||!Number.isFinite(width)||width<10||width>120)throw Error('Check actual field dimensions (20–200 m by 10–120 m)');
    if(!Number.isFinite(uncertaintyM)||uncertaintyM<1||uncertaintyM>5)throw Error('Anchor uncertainty must be declared between 1 and 5 m; imprecise anchors cannot calibrate this replay');
    if(!Array.isArray(anchors)||anchors.length!==4||!anchors.every(coordinate))throw Error('Enter all four WGS84 corners A, B, C, D');
    const origin={lat:anchors[0].lat,lng:anchors[0].lng},p=anchors.map(a=>localMeters(a,origin));
    const cross=p[1].e*p[2].n-p[1].n*p[2].e;
    if(Math.abs(cross)<length*width*.5)throw Error('Corners are collinear, too close, or incorrectly ordered');
    const hand=Math.sign(cross), q=[[0,0],[length,0],[0,width]];
    const qe=length/3,qn=hand*width/3,pe=(p[0].e+p[1].e+p[2].e)/3,pn=(p[0].n+p[1].n+p[2].n)/3;
    let dot=0,det=0;
    for(let i=0;i<3;i++){
      const x=q[i][0]-qe,y=hand*q[i][1]-qn,e=p[i].e-pe,n=p[i].n-pn;
      dot+=x*e+y*n;det+=x*n-y*e;
    }
    const angle=Math.atan2(det,dot),c=Math.cos(angle),s=Math.sin(angle);
    const u={e:c,n:s},v={e:-s*hand,n:c*hand},offset={e:pe-c*qe+s*qn,n:pn-s*qe-c*qn};
    const expected=[[0,0],[length,0],[0,width],[length,width]];
    const residuals=p.map((a,i)=>Math.hypot(a.e-(offset.e+u.e*expected[i][0]+v.e*expected[i][1]),a.n-(offset.n+u.n*expected[i][0]+v.n*expected[i][1])));
    const rms=Math.sqrt(residuals.slice(0,3).reduce((n,r)=>n+r*r,0)/3),max=Math.max(...residuals);
    return {schemaVersion:1,geometryVersion:'wgs84-enu-artwork-v1',sport,length,width,origin,u,v,offset,
      anchors:anchors.map(a=>({lat:a.lat,lng:a.lng})),uncertaintyM,rms,maxResidualM:max,checkDMetres:residuals[3],
      source:'manual-map-control-points',quality:'approximate',referenceHeightM:0};
  }
  // Legacy v1 remains strict. New map quality policy uses the SAME rigid fit,
  // with separate bounded VALID/APPROXIMATE classification, never scale/shear.
  function calibrate(input){
    const c=fitCalibration(input);
    if(c.rms>2||c.maxResidualM>3)throw Error('Calibration rejected: fit/independent D check exceeds 2 m RMS or 3 m maximum. Recheck corners and dimensions');
    return c;
  }
  const QUALITY_POLICY='map-calibration-quality-v1';
  function measurePolygon(corners){
    if(!Array.isArray(corners)||corners.length!==4||!corners.every(coordinate))throw Error('Select four finite WGS84 geographic corners');
    const p=corners.map(c=>localMeters(c,corners[0]));
    const distance=(a,b)=>Math.hypot(a.e-b.e,a.n-b.n);
    const sides=p.map((a,i)=>distance(a,p[(i+1)%4]));
    const angles=p.map((a,i)=>{const b=p[(i+3)%4],c=p[(i+1)%4];return Math.acos(Math.max(-1,Math.min(1,((b.e-a.e)*(c.e-a.e)+(b.n-a.n)*(c.n-a.n))/(distance(a,b)*distance(a,c)))))/RAD});
    const totalLength=(sides[0]+sides[2])/2,width=(sides[1]+sides[3])/2;
    const area=Math.abs(p.reduce((sum,a,i)=>sum+a.e*p[(i+1)%4].n-a.n*p[(i+1)%4].e,0))/2;
    const difference=(a,b)=>({metres:Math.abs(a-b),percent:(a+b)>0?Math.abs(a-b)/((a+b)/2)*100:null});
    return {lengthM:totalLength,totalLengthM:totalLength,widthM:width,polygonAreaM2:area,
      fieldAreaM2:totalLength*width,bearingDegrees:(Math.atan2(p[1].e-p[0].e,p[1].n-p[0].n)/RAD+360)%360,
      sideLengthsM:sides,anglesDegrees:angles,oppositeDifferences:{length:difference(sides[0],sides[2]),width:difference(sides[1],sides[3])},areaRatio:area/(totalLength*width)};
  }
  function calibratePolygon(input){
    const {sport,corners,variant='standard',extent='goal-lines',inGoal={start:0,end:0},selectionMode='pitch',autoAxis=true}=input||{};
    if(!['pitch','area'].includes(selectionMode))throw Error('Unknown selection mode');
    // Normalize only the coordinate frame. Preserve the selected geographic perimeter verbatim.
    if(autoAxis){
      const raw=measurePolygon(corners),shift=raw.widthM>raw.totalLengthM?1:0;
      const ordered=corners.map((_,i)=>corners[(i+shift)%4]);
      const c=calibratePolygon({...input,corners:ordered,autoAxis:false});
      return {...c,schemaVersion:4,geometryVersion:'wgs84-enu-artwork-v4',selectionMode,axisCornerOrder:ordered.map((_,i)=>(i+shift)%4),geoCorners:corners.map(p=>({lat:p.lat,lng:p.lng})),measuredDimensions:{...c.measuredDimensions,sideLengthsM:raw.sideLengthsM,oppositeDifferences:raw.oppositeDifferences}};
    }
    if(!Object.hasOwn(profiles,sport))throw Error('Choose Football or Rugby');
    if(!['standard','training'].includes(variant))throw Error('Unknown field profile');
    const measured=measurePolygon(corners),p=corners.map(c=>localMeters(c,corners[0]));
    const {sideLengthsM:sides,anglesDegrees:angles,totalLengthM:totalLength,widthM:width}=measured;
    const distance=(a,b)=>Math.hypot(a.e-b.e,a.n-b.n);
    for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(distance(p[i],p[j])<.5)throw Error('INVALID: two corners overlap (less than 0.5 m apart).');
    const cross=(a,b,c)=>(b.e-a.e)*(c.n-a.n)-(b.n-a.n)*(c.e-a.e);
    const intersects=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0;
    if(intersects(p[0],p[1],p[2],p[3])||intersects(p[1],p[2],p[3],p[0]))throw Error('INVALID: corners cross. Follow A → B → C → D around the boundary.');
    const signs=p.map((a,i)=>Math.sign(cross(a,p[(i+1)%4],p[(i+2)%4])));
    if(!signs.every(sign=>sign!==0&&sign===signs[0])||angles.some(a=>!Number.isFinite(a)||a<65||a>115)||measured.areaRatio<.85)throw Error('INVALID: concave, degenerate or severely deformed boundary (angles must be 65–115° and area ratio ≥85%).');
    if(selectionMode!=='area'&&totalLength<width*1.03)throw Error('INVALID: place B along the long side from A, then C along the short side.');
    const diff=measured.oppositeDifferences;
    if(diff.length.metres>Math.min(10,totalLength*.12)||diff.width.metres>Math.min(10,width*.12))throw Error('INVALID: opposite-side difference exceeds 10 m or 12%. Review the boundary; no points were moved.');
    if(!['goal-lines','full-area'].includes(extent)||sport==='football'&&extent!=='goal-lines')throw Error('INVALID: choose the correct playing-area boundary');
    let start=0,end=0;
    if(selectionMode==='pitch'&&sport==='rugby'&&extent==='full-area'){
      start=inGoal.start;end=inGoal.end;
      const min=variant==='standard'?6:1,max=variant==='standard'?22:30;
      if(!Number.isFinite(start)||!Number.isFinite(end)||start<min||end<min||start>max||end>max)throw Error('INVALID: enter BOTH actual in-goal depths ('+min+'–'+max+' m). No symmetry is assumed.');
    }
    const length=totalLength-start-end;
    if(length<20||length>(selectionMode==='area'?200:132)||width<10||width>(selectionMode==='area'?120:99)||(selectionMode!=='area'&&length<=width)||length/width>3.5)throw Error('INVALID: field dimensions/aspect ratio are unusable for the selected replay model.');
    const ranges=variant==='training'?{l:[20,120],w:[10,90]}:sport==='football'?{l:[90,120],w:[45,90]}:{l:[94,100],w:[68,70]};
    const inRange=(v,r,t)=>v>=r[0]-t&&v<=r[1]+t;
    const standardSize=inRange(length,ranges.l,.5)&&inRange(width,ranges.w,.5);
    const approximateSize=variant==='training'?standardSize:(length>=ranges.l[0]*.9&&length<=ranges.l[1]*1.1&&width>=ranges.w[0]*.9&&width<=ranges.w[1]*1.1);
    if(selectionMode==='pitch'&&!approximateSize)throw Error("INVALID: field dimensions don't match the selected sport even within the 10% map-selection envelope. Check boundary type or explicitly choose Modified / training.");
    const base=fitCalibration({sport,length:totalLength,width,uncertaintyM:3,anchors:[corners[0],corners[1],corners[3],corners[2]]});
    if(base.rms>5||base.maxResidualM>Math.min(10,width*.12))throw Error('INVALID: rigid fit exceeds 5 m RMS or the smaller of 10 m / 12% of width. No automatic reshaping is allowed.');
    const reasons=[];
    if(selectionMode==='area')reasons.push('Movement area only: internal pitch markings are unknown and cannot be inferred from green map coverage. Artwork is schematic, not aligned pitch lines.');
    if(diff.length.metres>Math.min(3,totalLength*.03)||diff.width.metres>Math.min(3,width*.03))reasons.push('Opposite sides differ beyond the VALID limit (3 m AND 3%).');
    if(angles.some(a=>a<80||a>100))reasons.push('One or more angles are outside 80–100°.');
    if(measured.areaRatio<.97)reasons.push('Selected outline area is below 97% of the reference rectangle.');
    if(base.rms>2||base.maxResidualM>3)reasons.push('Rigid-fit residual exceeds 2 m RMS or 3 m maximum.');
    if(selectionMode==='pitch'&&!standardSize)reasons.push('Measured dimensions are outside the normal '+sport+' profile. Confirm the boundary; actual metres are retained.');
    if(selectionMode==='pitch'&&!standardSize&&sport==='rugby'&&extent==='goal-lines')reasons.push('Between goal lines selected: check whether in-goal areas were included. None are removed automatically.');
    const status=reasons.length?'APPROXIMATE':'VALID';
    return {...base,schemaVersion:3,geometryVersion:'wgs84-enu-artwork-v3',qualityPolicy:QUALITY_POLICY,length,
      offset:{e:base.offset.e+base.u.e*start,n:base.offset.n+base.u.n*start},
      geoCorners:corners.map(c=>({lat:c.lat,lng:c.lng})),cornerOrder:'perimeter-A-B-C-D',
      selectionMode,variant,extent,inGoal:{start,end},source:'interactive-map-control-points',uncertaintyStatus:'unknown',
      measuredDimensions:{...measured,lengthM:length,fieldAreaM2:length*width},
      validationStatus:status,quality:status==='APPROXIMATE'?'approximate':'geometry-acceptable',
      calibrationAccuracy:{status:'unknown',spatialAccuracyM:null,rmsM:base.rms,maxResidualM:base.maxResidualM},
      warnings:[...reasons,'Map positioning accuracy is unknown; VALID means acceptable geometry, not surveyed accuracy.',
        ...(status==='APPROXIMATE'?['Field Replay will be indicative. Do not interpret field-line placement as exact.']:[]),
        ...(variant==='training'?['Modified / training profile; not a regulation-size claim.']:[]),
        ...(Math.abs(length-profiles[sport].length)>.5||Math.abs(width-profiles[sport].width)>.5?['Original artwork is schematic for these actual dimensions.']:[])]};
  }
  function assessPolygon(input){
    try{const c=calibratePolygon(input);return {status:c.validationStatus,calibration:c,measurements:c.measuredDimensions,warnings:c.warnings,errors:[]};}
    catch(error){let measurements=null;try{measurements=measurePolygon(input?.corners)}catch(_){}return {status:'INVALID',calibration:null,measurements,warnings:[],errors:[error.message]};}
  }
  // Recompute persisted geometry and classification, never trust stored quality flags.
  function validateCalibration(value){
    if(value&&[2,3,4].includes(value.schemaVersion)){
      if(value.geometryVersion!=='wgs84-enu-artwork-v'+value.schemaVersion)throw Error('Unsupported calibration version');
      const c=calibratePolygon({sport:value.sport,corners:value.geoCorners,variant:value.variant,extent:value.extent,inGoal:value.inGoal,selectionMode:value.selectionMode||'pitch',autoAxis:value.schemaVersion===4});
      const acknowledged=value.qualityPolicy===QUALITY_POLICY&&value.approximateAcknowledged===true&&typeof value.approximateAcknowledgedAt==='string'&&Number.isFinite(Date.parse(value.approximateAcknowledgedAt));
      return {...c,approximateAcknowledged:acknowledged,approximateAcknowledgedAt:acknowledged?value.approximateAcknowledgedAt:null,legacyQuality:value.schemaVersion===2};
    }
    if(!value||value.schemaVersion!==1||value.geometryVersion!=='wgs84-enu-artwork-v1')throw Error('Unsupported calibration version');
    return calibrate(value);
  }
  function toField(p,calibration){
    const q=localMeters(p,calibration.origin),e=q.e-calibration.offset.e,n=q.n-calibration.offset.n;
    return {x:e*calibration.u.e+n*calibration.u.n,y:e*calibration.v.e+n*calibration.v.n};
  }
  function axisAt(m,axis) {
    let i=1;while(i<axis.length-1 && m>axis[i][1])i++;
    const a=axis[i-1],b=axis[i];return a[0]+(m-a[1])/(b[1]-a[1])*(b[0]-a[0]);
  }
  function fieldToArtwork(p,c){
    const profile=profiles[c.sport];
    return {x:1536*axisAt(p.x/c.length*profile.length,profile.x),y:1024*axisAt(p.y/c.width*profile.width,profile.y)};
  }
  // Tessellate ONLY display lines where the schematic image scale changes.
  // These vertices are not saved GPS samples and never enter metrics.
  function artworkSegment(a,b,c){
    const profile=profiles[c.sport],times=[0,1];
    for(const [key,axis,actual,standard] of [['x',profile.x,c.length,profile.length],['y',profile.y,c.width,profile.width]]){
      if(b[key]===a[key])continue;
      axis.forEach(([,m])=>{const t=(m/standard*actual-a[key])/(b[key]-a[key]);if(t>0&&t<1)times.push(t)});
    }
    return [...new Set(times)].sort((a,b)=>a-b).map(t=>fieldToArtwork({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},c));
  }
  function buildReplay(session,calibration){
    const c=validateCalibration(calibration),start=session.startTimestamp??Date.parse(session.startTime),end=session.endTimestamp??Date.parse(session.endTime);
    if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)throw Error('Session timestamps unavailable');
    const modern=session.replaySchemaVersion===1 && Array.isArray(session.replayPoints);
    const raw=modern?session.replayPoints:(session.route||[]);
    const points=[];let breakNext=true,invalid=0;
    raw.forEach(p=>{
      if(!coordinate(p)||!Number.isFinite(p.timestamp)||p.timestamp<start||p.timestamp>end||!Number.isFinite(p.accuracy)||p.accuracy<0||p.accuracy>40 || (points.length && p.timestamp-start<=points[points.length-1].t)) {invalid++;breakNext=true;return;}
      const world=toField(p,c),art=fieldToArtwork(world,c),previous=points[points.length-1];
      const boundary=breakNext || p.newSegment===true || !previous || p.timestamp-start-previous.t>10000;
      points.push({...world,art,t:p.timestamp-start,accuracy:p.accuracy,newSegment:boundary,
        // 5 cm tolerance is classification only: coordinates are never clamped.
        outside:world.x<-.05||world.x>c.length+.05||world.y<-.05||world.y>c.width+.05});breakNext=false;
    });
    const gaps=[];
    if(points.length){
      if(points[0].t>0)gaps.push({start:0,end:points[0].t,kind:'no-data'});
      for(let i=1;i<points.length;i++)if(points[i].newSegment)gaps.push({start:points[i-1].t,end:points[i].t,kind:'recording-gap'});
      if(points.at(-1).t<end-start)gaps.push({start:points.at(-1).t,end:end-start,kind:'no-data'});
    }else if(end>start)gaps.push({start:0,end:end-start,kind:'no-data'});
    return {calibration:c,points,gaps,durationMs:end-start,invalid,legacy:!modern,
      outsideCount:points.filter(p=>p.outside).length,
      accuracy:points.length?points.reduce((a,p)=>({min:Math.min(a.min,p.accuracy),max:Math.max(a.max,p.accuracy)}),{min:Infinity,max:0}):null,
      quality:'approximate',calibrationStatus:c.validationStatus||'LEGACY',calibrationWarnings:c.warnings||[],source:'phone-gps-actual',planned:null};
  }
  function sampleAt(model,t){
    const points=model.points;if(!points.length||!Number.isFinite(t))return null;
    let lo=0,hi=points.length;
    while(lo<hi){const mid=(lo+hi)>>1;if(points[mid].t<t)lo=mid+1;else hi=mid;}
    if(lo<points.length&&points[lo].t===t)return {...points[lo],interpolated:false};
    if(lo===0||lo===points.length)return null;
    const a=points[lo-1],b=points[lo];
    if(b.newSegment || b.t-a.t>10000)return null;
    const r=(t-a.t)/(b.t-a.t),p={x:a.x+(b.x-a.x)*r,y:a.y+(b.y-a.y)*r};
    return {...p,art:fieldToArtwork(p,model.calibration),accuracy:Math.max(a.accuracy,b.accuracy),interpolated:true};
  }
  function viewport(points,zoom=1){
    // Include the whole original 3:2 asset and ALL off-field points at Fit.
    let minX=0,minY=0,maxX=1536,maxY=1024;
    points.forEach(p=>{minX=Math.min(minX,p.art.x-30);minY=Math.min(minY,p.art.y-30);maxX=Math.max(maxX,p.art.x+30);maxY=Math.max(maxY,p.art.y+30)});
    const w=maxX-minX,h=maxY-minY,z=Math.min(4,Math.max(1,zoom));
    return {x:minX+w/2-w/(2*z),y:minY+h/2-h/(2*z),width:w/z,height:h/z};
  }
  const api={profiles,coordinate,ecef,localMeters,calibrate,measurePolygon,calibratePolygon,assessPolygon,validateCalibration,toField,fieldToArtwork,artworkSegment,buildReplay,sampleAt,viewport};
  if(typeof module==='object' && module.exports)module.exports=api;else root.PACFieldGeometry=api;
})(globalThis);
