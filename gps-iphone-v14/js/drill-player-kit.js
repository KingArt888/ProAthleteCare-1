(function () {
"use strict";
  function recolorShirtPixels(data, width, height, color, frameKey = "A") {
    const masks = {
      A:[[99,98],[153,100],[206,124],[231,204],[192,215],[183,248],[189,313],[50,319],[47,230],[54,207],[13,199],[32,127],[65,110]],
      B:[[111,94],[153,96],[206,122],[212,191],[167,199],[165,229],[203,302],[57,316],[62,211],[57,184],[17,180],[38,124],[65,104]],
      C:[[148,94],[184,94],[249,126],[258,204],[215,211],[207,263],[215,303],[73,314],[84,220],[81,181],[32,180],[28,161],[68,113]],
      D:[[202,91],[241,95],[296,125],[311,210],[272,220],[248,294],[110,292],[132,223],[136,179],[109,174],[80,146],[111,116],[142,102]]
    };
    const polygon = masks[frameKey] || masks.A;
    const inside = (x,y) => { let hit=false; for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) { const a=polygon[i],b=polygon[j]; if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) hit=!hit; } return hit; };
    const rgb = [1,3,5].map(index => parseInt(color.slice(index,index+2),16));
    for (let y=Math.ceil(height*.15); y<height*.52; y++) {
      for (let x=0; x<width; x++) {
        const i=(y*width+x)*4, r=data[i], g=data[i+1], b=data[i+2];
        // Per-pose garment boundary keeps skin/head out; preserve black trim and alpha.
        if (!inside(x,y) || !data[i+3] || r-b<25 || g-b<20 || (g-b)/(r-b)<.45 || b>g*.85) continue;
        const shade=Math.min(1,r/245);
        const highlight=Math.max(0,(b-45)/210)*.3;
        for(let c=0;c<3;c++) data[i+c]=Math.round(rgb[c]*shade*(1-highlight)+255*highlight);
      }
    }
    return data;
  }


  function erasePrintedNumber(data, width, height, key, variant = "yellow") {
    // Bounds of the printed 7 in each original pose. Reconstruct only this
    // cloth patch from the neighbouring fabric; leave skin and alpha intact.
    const regions = variant === "yellow"
      ? {A:[81,129,148,215],B:[84,121,149,208],C:[114,119,183,208],D:[155,115,232,199]}
      : {A:[120,143,184,232],B:[73,131,137,222],C:[77,126,143,218],D:[137,116,213,209]};
    const box=regions[key];
    if (!box) return data;
    const [left,top,right,bottom]=box;
    if(right>=width || bottom>=height) return data;
    const original=data.slice();
    for(let y=top;y<=bottom;y++) {
      for(let x=left;x<=right;x++) {
        const i=(y*width+x)*4, a=(y*width+left)*4, b=(y*width+right)*4;
        const t=(x-left)/(right-left);
        const blend=Math.min(1,(x-left)/3,(right-x)/3,(y-top)/3,(bottom-y)/3);
        for(let c=0;c<3;c++) data[i+c]=Math.round(original[i+c]*(1-blend)+(original[a+c]*(1-t)+original[b+c]*t)*blend);
      }
    }
    return data;
  }

  const cache = new WeakMap();
  function frame(image, color, key, variant = "yellow") {
    if (!image) return null;
    const custom = /^#[0-9a-f]{6}$/i.test(color || "");
    const cacheKey = variant + ":" + key + ":" + (custom ? color : "original");
    let variants=cache.get(image);
    if (!variants) { variants=new Map(); cache.set(image,variants); }
    if (variants.has(cacheKey)) return variants.get(cacheKey);
    const canvas=document.createElement("canvas");
    canvas.width=image.naturalWidth || image.width; canvas.height=image.naturalHeight || image.height;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    ctx.drawImage(image,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height);
    erasePrintedNumber(data.data,canvas.width,canvas.height,key,variant);
    if(custom) recolorShirtPixels(data.data,canvas.width,canvas.height,color,key);
    ctx.putImageData(data,0,0);
    if(variants.size>=32) variants.delete(variants.keys().next().value);
    variants.set(cacheKey,canvas); return canvas;
  }
  // Garment areas on the original 1536 × 1024 action sheets.
  const actionGarments = {
    lineoutLift: {
      yellow:[[[359,157],[400,151],[409,183],[400,239],[359,239]],[[293,335],[337,333],[344,368],[333,415],[287,413]],[[428,346],[472,331],[470,416],[419,416]],[[1023,342],[1068,334],[1080,366],[1064,416],[1021,415]],[[392,645],[443,638],[454,667],[446,722],[396,719]],[[349,784],[393,781],[407,811],[398,861],[351,866]],[[1039,782],[1080,777],[1100,810],[1088,869],[1038,861]],[[1240,782],[1284,777],[1305,806],[1317,850],[1269,859]]],
      black:[[[515,370],[557,364],[578,411],[589,439],[548,449]],[[1095,133],[1164,128],[1165,169],[1157,221],[1106,216]],[[1103,331],[1175,324],[1176,371],[1165,415],[1106,412]],[[1191,338],[1243,338],[1261,395],[1263,436],[1227,443]],[[1291,372],[1332,371],[1353,420],[1356,445],[1321,452]],[[400,806],[443,793],[470,826],[475,900],[409,902]],[[481,783],[543,763],[566,806],[584,863],[535,885],[510,835]],[[1122,642],[1176,639],[1195,671],[1181,722],[1137,719]],[[1109,808],[1150,796],[1183,828],[1186,906],[1132,905]],[[1196,801],[1241,794],[1261,830],[1263,882],[1220,885]]]
    },
    scrumSide:{
      black:[[[290,131],[371,131],[413,154],[402,181],[304,181]],[[292,182],[369,179],[409,211],[399,240],[310,233]],[[276,245],[361,244],[416,272],[402,302],[299,291]],[[1074,132],[1143,132],[1195,160],[1180,187],[1097,179]],[[1060,177],[1120,180],[1154,207],[1135,233],[1062,218]],[[1058,212],[1119,215],[1156,241],[1159,272],[1070,267]],[[1100,260],[1150,260],[1176,281],[1167,309],[1102,303]],[[285,617],[344,611],[388,632],[374,659],[287,655]],[[276,655],[357,650],[386,673],[374,697],[285,691]],[[293,687],[361,684],[402,709],[392,742],[310,734]],[[1009,646],[1069,642],[1100,668],[1080,698],[1000,693]],[[1053,688],[1115,682],[1146,712],[1134,755],[1060,749]]],
      yellow:[[[441,140],[493,128],[531,154],[576,146],[591,181],[536,194],[475,185],[442,181]],[[449,201],[496,192],[556,199],[602,209],[617,247],[550,253],[481,237],[442,233]],[[451,261],[496,249],[559,251],[597,271],[601,306],[540,322],[477,307]],[[1201,158],[1252,153],[1298,161],[1375,190],[1395,220],[1334,226],[1258,202]],[[1191,204],[1238,203],[1312,221],[1378,241],[1385,272],[1336,287],[1259,260],[1190,249]],[[1170,276],[1208,266],[1242,289],[1303,276],[1342,298],[1353,331],[1282,338],[1226,312],[1179,311]],[[399,634],[455,622],[486,644],[540,632],[566,650],[565,677],[503,682],[449,662],[399,661]],[[399,672],[447,665],[501,676],[558,690],[577,715],[548,742],[485,728],[421,713]],[[426,706],[469,699],[520,715],[549,742],[532,766],[473,756],[441,735]],[[1147,694],[1202,685],[1237,711],[1230,754],[1150,755]],[[1225,695],[1276,695],[1315,725],[1311,759],[1240,751]],[[1295,686],[1345,684],[1369,714],[1378,756],[1326,758]]]
    },
    scrumRear:{
      black:[[[986,239],[1040,228],[1071,245],[1057,278],[995,283]],[[1067,217],[1116,213],[1155,236],[1142,260],[1088,259]],[[1048,283],[1090,281],[1124,308],[1116,342],[1052,341]],[[287,657],[345,650],[387,678],[378,704],[295,698]],[[302,706],[363,701],[414,729],[408,757],[332,750]],[[1027,675],[1081,665],[1116,695],[1109,722],[1038,717]],[[1104,696],[1149,686],[1184,720],[1170,748],[1120,746]]],
      yellow:[[[1198,239],[1236,233],[1295,254],[1295,277],[1231,278]],[[1197,272],[1241,267],[1304,284],[1332,305],[1327,327],[1253,325]],[[1125,306],[1170,297],[1202,327],[1213,359],[1130,362]],[[1195,312],[1239,304],[1278,325],[1296,355],[1231,362]],[[401,671],[449,658],[478,678],[529,667],[563,697],[562,720],[482,710],[417,697]],[[433,710],[479,701],[525,725],[572,727],[595,762],[571,783],[507,760],[443,749]],[[1171,685],[1210,679],[1253,697],[1245,716],[1189,713]],[[1174,732],[1210,721],[1241,746],[1257,783],[1171,780]],[[1241,737],[1277,729],[1318,760],[1329,785],[1270,789]]]
    }
  };
  function recolorActionPixels(data,width,height,key,colours) {
    const regions=actionGarments[key];
    if(!regions) return data;
    const inside=(x,y,p)=>{let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
    for(const team of ["black","yellow"]){
      const color=colours[team];
      if(!/^#[0-9a-f]{6}$/i.test(color||""))continue;
      const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
      for(const polygon of regions[team]){
        const left=Math.max(0,Math.floor(Math.min(...polygon.map(p=>p[0])))),right=Math.min(width-1,Math.ceil(Math.max(...polygon.map(p=>p[0]))));
        const top=Math.max(0,Math.floor(Math.min(...polygon.map(p=>p[1])))),bottom=Math.min(height-1,Math.ceil(Math.max(...polygon.map(p=>p[1]))));
        for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
          if(!inside(x,y,polygon))continue;
          const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b);
          if(!data[i+3])continue;
          const gold=r-b>30&&g-b>25&&(g-b)/(r-b)>.7;
          const dark=max<115&&max-min<24;
          if(team==="yellow"?!gold:!dark)continue;
          const shade=team==="yellow"?Math.min(1,r/245):Math.min(1,.38+max/145);
          for(let c=0;c<3;c++)data[i+c]=Math.round(rgb[c]*shade);
        }
      }
    }
    return data;
  }
  const actionCache=new WeakMap();
  function actionFrame(image,key,colours) {
    if(!image||(!colours.black&&!colours.yellow))return image;
    let variants=actionCache.get(image);
    if(!variants){variants=new Map();actionCache.set(image,variants);}
    const cacheKey=key+":"+colours.black+":"+colours.yellow;
    if(variants.has(cacheKey))return variants.get(cacheKey);
    const canvas=document.createElement("canvas");canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    recolorActionPixels(pixels.data,canvas.width,canvas.height,key,colours);
    ctx.putImageData(pixels,0,0);
    if(variants.size>=12)variants.delete(variants.keys().next().value);
    variants.set(cacheKey,canvas);return canvas;
  }

  function circleColours(model) {
    const custom = /^#[0-9a-f]{6}$/i.test(model.customShirtColor || "");
    const fill = custom ? model.customShirtColor : (model.teamVariant === "yellow" ? "#ffcd28" : "#020202");
    const rgb = [1,3,5].map(i => parseInt(fill.slice(i,i+2),16)/255).map(v => v <= .04045 ? v/12.92 : Math.pow((v+.055)/1.055,2.4));
    const light = .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2] > .179;
    return {fill, text:light ? "#050505" : "#ffffff", stroke:light ? "#050505" : "#ffcd28"};
  }
  function styleCircle(root, model) {
    const colours = circleColours(model);
    root.findOne?.(".pac-player-number-overlay-bg")?.fill?.(colours.fill);
    root.findOne?.(".pac-player-number-overlay-text")?.fill?.(colours.text);
  }
  function styleBadge(root, model) {
    if (String(model.role || model.playerRole || "").toUpperCase() === "GOALKEEPER") return;
    const plate=root.findOne?.(".player-number-backplate"), badge=root.findOne?.(".player-number-badge");
    if(!plate || !badge) return;
    // Number-only style: keep the legacy plate hidden.
    // Both shapes share the same centre, slightly left of the old placement.
    plate.setAttrs({x:-13.5,y:-34,width:24,height:22,cornerRadius:2,
      fill:"#020202",opacity:0,visible:false,strokeEnabled:false,strokeWidth:0});
    badge.setAttrs({x:-13.5,y:-34.5,width:24,height:19,fontSize:15.5,
      padding:0,lineHeight:1,wrap:"none",ellipsis:false,
      align:"center",verticalAlign:"middle",fontStyle:"900",fill:circleColours(model).text === "#ffffff" ? "#ffcd28" : "#000000",
      opacity:1,visible:true,strokeEnabled:false,strokeWidth:0,fillAfterStrokeEnabled:true});

  }
  window.PACPlayerKit={frame,recolorShirtPixels,erasePrintedNumber,styleBadge,circleColours,styleCircle,actionFrame,recolorActionPixels};
})();
