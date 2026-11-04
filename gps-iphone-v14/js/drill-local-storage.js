/* Lossless dictionary storage for repeated drill recipes; plain legacy JSON remains supported. */
(function(root){
  function pack(drill){
    if (!drill || drill.packedDrill?.format==='pac-dictionary-1') return drill;
    const nodes=[],seen=new Map();
    function encode(value){
      if (!value || typeof value!=='object') return value;
      const signature=JSON.stringify(value);
      if(seen.has(signature))return {r:seen.get(signature)};
      const node=Array.isArray(value)?{a:value.map(encode)}:{o:Object.entries(value).map(([k,v])=>[k,encode(v)])};
      const index=nodes.length;nodes.push(node);seen.set(signature,index);return {r:index};
    }
    const packedDrill={format:'pac-dictionary-1',root:encode(drill),nodes};
    const envelope={};
    for(const [key,value] of Object.entries(drill))if(value===null||typeof value!=='object')envelope[key]=value;
    envelope.packedDrill=packedDrill;
    return JSON.stringify(envelope).length<JSON.stringify(drill).length?envelope:drill;
  }
  function unpack(drill){
    const p=drill?.packedDrill;if(p?.format!=='pac-dictionary-1')return drill;
    const visiting=new Set();
    function decode(ref){
      if(!ref || typeof ref!=='object')return ref;
      if(!Number.isInteger(ref.r)||!p.nodes[ref.r]||visiting.has(ref.r))throw Error('Invalid saved drill dictionary');
      visiting.add(ref.r);const n=p.nodes[ref.r];
      const value=n.a?n.a.map(decode):Object.fromEntries(n.o.map(([k,v])=>[k,decode(v)]));
      visiting.delete(ref.r);return value;
    }
    return decode(p.root);
  }
  function read(){const list=JSON.parse(localStorage.getItem('pac_imported_drill_library')||'[]');return Array.isArray(list)?list.map(unpack):[];}
  function write(list){localStorage.setItem('pac_imported_drill_library',JSON.stringify(list.map(pack)));}
  const api={pack,unpack,read,write};root.PACDrillLocalStorage=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
