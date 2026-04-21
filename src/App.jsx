import { useState } from "react";

const USD_CLP = 960;
const BM = {
  "B2C": { ctr:2.5, cvr:2.8, roi:150, roas:4.0, cpv:800,    cpvUSD:0.83,  src:{ctr:"Shopify 2025",cvr:"Baymard 2024",roi:"Nielsen 2025",roas:"Meta Insights",cpv:"eMarketer 2024"} },
  "B2B": { ctr:1.8, cvr:1.2, roi:120, roas:3.0, cpv:2500,   cpvUSD:2.60,  src:{ctr:"HubSpot 2025",cvr:"Salesforce",roi:"Gartner 2024",roas:"LinkedIn B2B",cpv:"HubSpot 2025"} },
  "SaaS":{ ctr:3.0, cvr:4.5, roi:200, roas:5.5, cpv:400,    cpvUSD:0.42,  src:{ctr:"WordStream 2025",cvr:"OpenView 2024",roi:"McKinsey",roas:"G2/Capterra",cpv:"ProfitWell 2024"} },
};
const MODELOS = ["B2C","B2B","SaaS"];
const MODELO_FULL = { "B2C":"B2C (Ecommerce)", "B2B":"B2B (Leads)", "SaaS":"SaaS (Suscripciones)" };
const CANALES_LIST = ["Meta Ads","Google Ads","Email Marketing","SEO / Orgánico","TikTok Ads","LinkedIn Ads","Otro"];
const TABS = [{id:"input",icon:"⚡",label:"Strategy Engine"},{id:"bench",icon:"📊",label:"Metodología & Bench"},{id:"about",icon:"📖",label:"Instrucciones y Filosofía"}];
const BENCH_ROWS = [
  ["Tasa de Conv. Global (B2C)","1.8% – 2.5%","4.1% – 6.5% (High Intent)","Shopify, Adobe (2025)"],
  ["ROAS Meta Ads","2.8x","4.5x (Con ofertas > 25%)","Nielsen, Facebook Insights"],
  ["ROAS Google Search","3.5x","4.8x (Long-Tail)","Salesforce, Semrush"],
  ["Tasa Abandono Carrito","70.19%","20% mejora optimizando checkout","Baymard Institute (2024)"],
  ["Costo Clic B2B (MQLs)","$100–$350 USD","$50 USD (Gated Content)","HubSpot SoM 2025"],
];

const nv=(v)=>parseFloat(v)||0;
const safe=(v)=>isNaN(v)||!isFinite(v)?null:v;
const fp=(v)=>v==null?"—":`${Number(v).toLocaleString("es-CL",{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
const fx=(v)=>v==null?"—":`${Number(v).toLocaleString("es-CL",{minimumFractionDigits:1,maximumFractionDigits:1})}x`;
const fm=(v,cur)=>v==null?"—":cur==="USD"?`$${(v/USD_CLP).toFixed(2)} USD`:`$${Math.round(v).toLocaleString("es-CL")} CLP`;
const st=(v,b,hi=true)=>{if(v==null||b==null)return"n";const r=v/b;return hi?(r>=1.05?"ok":r>=0.75?"w":"b"):(r<=0.95?"ok":r<=1.25?"w":"b");};
const SC={ok:"#22c55e",w:"#f59e0b",b:"#ef4444",n:"#94a3b8"};
const SB={ok:"#f0fdf4",w:"#fffbeb",b:"#fef2f2",n:"#f8fafc"};
const SL={ok:"Sobre benchmark",w:"En rango aceptable",b:"Bajo benchmark",n:"—"};
const er=()=>({inv:"",alc:"",cli:"",conv:"",ing:""});

function Chip({label,value,stat,bench,src}){
  const c=SC[stat],bg=SB[stat];
  return <div style={{background:bg,border:`1.5px solid ${c}33`,borderRadius:12,padding:"12px 14px"}}>
    <div style={{fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>{label}</div>
    <div style={{fontSize:20,fontWeight:800,color:"#0f172a",fontFamily:"Georgia,serif",marginBottom:3}}>{value}</div>
    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}><div style={{width:6,height:6,borderRadius:"50%",background:c}}/><span style={{fontSize:9,color:c,fontWeight:700}}>{SL[stat]}</span></div>
    {bench&&<div style={{fontSize:9,color:"#94a3b8"}}>Bench: <b>{bench}</b> · {src}</div>}
  </div>;
}

function MDR({text}){
  const lines=text.split("\n"),out=[]; let rows=[],inT=false,k=0;
  const flush=()=>{
    if(rows.length<2){rows=[];inT=false;return;}
    const hh=rows[0].split("|").map(s=>s.trim()).filter(Boolean);
    const bb=rows.slice(2).filter(r=>r.trim()&&!/^[\|\s\-:]+$/.test(r));
    out.push(<div key={k++} style={{overflowX:"auto",margin:"8px 0"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr>{hh.map((h,i)=><th key={i} style={{background:"#0f172a",color:"#f8fafc",padding:"6px 10px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
        <tbody>{bb.map((row,ri)=>{const cc=row.split("|").map(s=>s.trim()).filter(Boolean);return<tr key={ri} style={{background:ri%2===0?"#f8fafc":"white"}}>{cc.map((c,ci)=><td key={ci} style={{padding:"6px 10px",borderBottom:"1px solid #e2e8f0",color:"#334155",fontSize:11}}>{c}</td>)}</tr>;})}</tbody>
      </table></div>);
    rows=[];inT=false;
  };
  for(const line of lines){
    if(line.startsWith("|")){inT=true;rows.push(line);}
    else{
      if(inT)flush();
      if(line.startsWith("## "))      out.push(<h3 key={k++} style={{fontSize:12,fontWeight:800,color:"#0f172a",margin:"14px 0 6px",paddingBottom:4,borderBottom:"2px solid #e2e8f0",fontFamily:"Georgia,serif"}}>{line.slice(3)}</h3>);
      else if(line.startsWith("# ")) out.push(<h2 key={k++} style={{fontSize:15,fontWeight:800,color:"#0f172a",margin:"6px 0 4px",fontFamily:"Georgia,serif"}}>{line.slice(2)}</h2>);
      else if(/^[-*] /.test(line))   out.push(<li key={k++} style={{fontSize:11,color:"#475569",margin:"2px 0 2px 12px",lineHeight:1.6}}>{line.slice(2)}</li>);
      else if(line.trim())           out.push(<p  key={k++} style={{fontSize:11,color:"#475569",margin:"2px 0",lineHeight:1.6}}>{line}</p>);
    }
  }
  if(inT)flush();
  return <div>{out}</div>;
}

export default function App(){
  const [tab,setTab]=useState("input");
  const [mod,setMod]=useState("B2C");
  const [cur,setCur]=useState("CLP");
  const [mes,setMes]=useState("Q3 2025");
  const [canales,setCanales]=useState({"Meta Ads":er()});
  const [diag,setDiag]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [saved,setSaved]=useState(false);
  const bm=BM[mod];
  const ac=Object.keys(canales);
  const toClp=(v)=>cur==="USD"?nv(v)*USD_CLP:nv(v);
  const tI=ac.reduce((s,c)=>s+toClp(canales[c].inv),0);
  const tA=ac.reduce((s,c)=>s+nv(canales[c].alc),0);
  const tC=ac.reduce((s,c)=>s+nv(canales[c].cli),0);
  const tV=ac.reduce((s,c)=>s+nv(canales[c].conv),0);
  const tG=ac.reduce((s,c)=>s+toClp(canales[c].ing),0);
  const ctr=safe(tA>0?(tC/tA)*100:null);
  const cvr=safe(tC>0?(tV/tC)*100:null);
  const cpv=safe(tV>0?tI/tV:null);
  const roi=safe(tI>0?((tG-tI)/tI)*100:null);
  const roas=safe(tI>0?tG/tI:null);
  const cpvBench=cur==="USD"?bm.cpvUSD*USD_CLP:bm.cpv;
  const dScore=[ctr,cvr,roi,roas,cpv].filter(v=>v!=null).length;
  const dLabel=["Dato Bruto","Información","Conocimiento","Conocimiento Avanzado","Sabiduría Estratégica"][Math.min(dScore,4)];
  const canRun=tI>0&&tG>0&&tV>0;

  function addC(name){if(!canales[name])setCanales(p=>({...p,[name]:er()}));}
  function delC(name){if(ac.length===1)return;const n={...canales};delete n[name];setCanales(n);}
  function upd(name,f,v){setCanales(p=>({...p,[name]:{...p[name],[f]:v}}));}

  function cMet(name){
    const r=canales[name];
    const i=toClp(r.inv),g=toClp(r.ing),c=nv(r.cli),v=nv(r.conv);
    return {roas:safe(i>0?g/i:null),roi:safe(i>0?((g-i)/i)*100:null),cvr:safe(c>0?(v/c)*100:null)};
  }

  async function run(){
    if(!canRun)return;
    setLoading(true);setErr("");setDiag("");
    const breakdown=ac.map(name=>{
      const r=canales[name];const m=cMet(name);
      return `  ${name}: Inv=${fm(toClp(r.inv),"CLP")} Ing=${fm(toClp(r.ing),"CLP")} Clics=${nv(r.cli)} Conv=${nv(r.conv)} | ROAS=${fx(m.roas)} ROI=${fp(m.roi)} CVR=${fp(m.cvr)}`;
    }).join("\n");
    const ud=`MODELO: ${MODELO_FULL[mod]} | MONEDA: ${cur} | PERÍODO: ${mes}\nCANALES:\n${breakdown}\nTOTALES: Inv=${fm(tI,"CLP")} Ing=${fm(tG,"CLP")} CTR=${fp(ctr)}(bench ${bm.ctr}%) CVR=${fp(cvr)}(bench ${bm.cvr}%) CPV=${fm(cpv,"CLP")}(bench $${bm.cpv}) ROI=${fp(roi)}(bench ${bm.roi}%) ROAS=${fx(roas)}(bench ${bm.roas}x) DIKW=${dLabel}`;
    try{
      const res=await fetch("/.netlify/functions/gemini",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ userData: ud })
      });
      if(!res.ok){const e=await res.json();throw new Error(e?.error||JSON.stringify(e));}
      const data=await res.json();
      const txt=data?.text;
      if(txt){setDiag(txt);setSaved(true);}
      else setErr("Sin respuesta de la IA. Intenta nuevamente.");
    }catch(e){setErr(`Error: ${e.message}`);}
    finally{setLoading(false);}
  }

  const inp=(key,label,full,cname)=>(
    <div key={key} style={full?{gridColumn:"1/-1"}:{}}>
      <label style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:2}}>{label} {cur==="USD"&&(key==="inv"||key==="ing")?"(USD)":key==="inv"||key==="ing"?"(CLP)":""}</label>
      <input type="number" min="0" value={canales[cname][key]} onChange={e=>upd(cname,key,e.target.value)}
        style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,fontWeight:600,color:"#0f172a",background:"white"}}
        onFocus={e=>e.target.style.borderColor="#3b82f6"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    </div>
  );

  const s={layout:{display:"flex",minHeight:"100vh",background:"#0f172a",fontFamily:"'DM Sans',system-ui,sans-serif"},main:{flex:1,background:"#f1f5f9",overflow:"auto"}};

  return <div style={s.layout}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}button,input,select{font-family:inherit}input:focus,select:focus{outline:none}@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}.fu{animation:fu .3s ease forwards}.pulse{animation:p 1.2s infinite}@media print{.np{display:none!important}}`}</style>

    {/* Sidebar */}
    <aside className="np" style={{width:210,background:"#0f172a",borderRight:"1px solid #1e293b",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflow:"auto"}}>
      <div style={{padding:"16px 15px 12px",borderBottom:"1px solid #1e293b"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
          <div style={{width:24,height:24,background:"#3b82f6",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <span style={{fontSize:13,fontWeight:800,color:"white",letterSpacing:"-0.02em"}}>MetricsHub</span>
        </div>
        <div style={{fontSize:9,color:"#475569",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{MODELO_FULL[mod].split(" ")[0]} · {mes}</div>
      </div>
      <div style={{padding:"8px 7px",flex:1}}>
        <div style={{fontSize:9,fontWeight:700,color:"#475569",letterSpacing:"0.1em",textTransform:"uppercase",padding:"3px 9px 5px"}}>NAVIGATION</div>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:7,border:"none",background:tab===t.id?"#1e293b":"transparent",color:tab===t.id?"white":"#64748b",fontSize:12,fontWeight:tab===t.id?700:500,display:"flex",alignItems:"center",gap:7,marginBottom:1,cursor:"pointer"}}><span>{t.icon}</span>{t.label}</button>)}
      </div>
      <div style={{padding:"9px 15px",borderTop:"1px solid #1e293b"}}>
        <div style={{fontSize:9,fontWeight:700,color:"#475569",letterSpacing:"0.1em",marginBottom:4,textTransform:"uppercase"}}>AI ENGINE</div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:loading?"#f59e0b":"#22c55e"}} className={loading?"pulse":""}/><span style={{fontSize:10,color:"#94a3b8"}}>{loading?"Procesando...":"Operational"}</span></div>
        <div style={{fontSize:9,color:"#334155",marginTop:1}}>Gemini 1.5 Flash via Netlify</div>
      </div>
    </aside>

    {/* Main */}
    <main style={s.main}>
      {/* Topbar */}
      <div className="np" style={{background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 22px",height:46,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:"#0f172a",letterSpacing:"-0.01em"}}>{TABS.find(t=>t.id===tab)?.label}</div>
          <div style={{fontSize:9,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>{MODELO_FULL[mod].split(" ")[0]} · {mes} · {ac.length} canal{ac.length>1?"es":""}</div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {saved&&<span style={{fontSize:9,color:"#22c55e",fontWeight:700,background:"#f0fdf4",padding:"2px 7px",borderRadius:5}}>✓ Guardado</span>}
          <div style={{display:"flex",background:"#f1f5f9",borderRadius:7,padding:2,gap:1}}>
            {["CLP","USD"].map(c=><button key={c} onClick={()=>setCur(c)} style={{padding:"3px 9px",borderRadius:5,border:"none",background:cur===c?"#0f172a":"transparent",color:cur===c?"white":"#64748b",fontSize:11,fontWeight:700,cursor:"pointer"}}>{c}</button>)}
          </div>
          <div style={{width:24,height:24,borderRadius:"50%",background:"#3b82f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"white"}}>JD</div>
        </div>
      </div>

      <div style={{padding:"20px 24px",maxWidth:1000}}>

        {/* ── TAB STRATEGY ENGINE ── */}
        {tab==="input"&&<div className="fu">
          {/* Modelo + período */}
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:16,alignItems:"end"}}>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Modelo de Negocio</div>
              <div style={{display:"flex",gap:6}}>
                {MODELOS.map(m=><button key={m} onClick={()=>setMod(m)} style={{padding:"7px 13px",borderRadius:8,border:`2px solid ${mod===m?"#3b82f6":"#e2e8f0"}`,background:mod===m?"#3b82f6":"white",color:mod===m?"white":"#334155",fontSize:12,fontWeight:700,cursor:"pointer"}}>{MODELO_FULL[m]}</button>)}
              </div>
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Período</div>
              <input value={mes} onChange={e=>setMes(e.target.value)} placeholder="Ej: Octubre 2025" style={{padding:"7px 11px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:12,fontWeight:600,color:"#0f172a",width:130}}/>
            </div>
          </div>

          {/* Canales */}
          <div style={{background:"white",borderRadius:13,padding:"15px 17px",border:"1px solid #e2e8f0",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:800,color:"#0f172a",fontFamily:"Georgia,serif"}}>Canales Activos <span style={{fontSize:10,fontWeight:500,color:"#94a3b8"}}>(modelo atribución multi-canal)</span></div>
              <select onChange={e=>{if(e.target.value){addC(e.target.value);e.target.value=""}}} defaultValue="" style={{padding:"5px 10px",borderRadius:7,border:"1.5px solid #3b82f6",background:"white",fontSize:11,fontWeight:700,color:"#3b82f6",cursor:"pointer"}}>
                <option value="" disabled>+ Agregar canal</option>
                {CANALES_LIST.filter(c=>!canales[c]).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            {ac.map(name=>{
              const m=cMet(name);
              return <div key={name} style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"13px 15px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:"#3b82f6"}}/>
                    <span style={{fontSize:12,fontWeight:800,color:"#0f172a"}}>{name}</span>
                    {m.roas!=null&&<span style={{fontSize:10,fontWeight:700,color:m.roas>=bm.roas?"#22c55e":"#ef4444",background:m.roas>=bm.roas?"#f0fdf4":"#fef2f2",padding:"1px 6px",borderRadius:4}}>ROAS {fx(m.roas)}</span>}
                    {m.roi!=null&&<span style={{fontSize:10,fontWeight:700,color:m.roi>=bm.roi?"#22c55e":"#ef4444",background:m.roi>=bm.roi?"#f0fdf4":"#fef2f2",padding:"1px 6px",borderRadius:4}}>ROI {fp(m.roi)}</span>}
                  </div>
                  {ac.length>1&&<button onClick={()=>delC(name)} style={{border:"none",background:"none",color:"#ef4444",fontSize:15,cursor:"pointer"}}>×</button>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {inp("inv","Inversión",false,name)}
                  {inp("ing","Ingreso generado",false,name)}
                  {inp("alc","Alcance / Impresiones",false,name)}
                  {inp("cli","Clics",false,name)}
                  {inp("conv","Conversiones",true,name)}
                </div>
              </div>;
            })}
          </div>

          {/* KPIs */}
          {dScore>0&&<>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12}}>
              <Chip label="CTR"  value={fp(ctr)}      stat={st(ctr,bm.ctr)}   bench={`${bm.ctr}%`}     src={bm.src.ctr}/>
              <Chip label="CVR"  value={fp(cvr)}      stat={st(cvr,bm.cvr)}   bench={`${bm.cvr}%`}     src={bm.src.cvr}/>
              <Chip label="CPV"  value={fm(cpv,cur)}  stat={st(cpv,cpvBench,false)} bench={cur==="USD"?`$${bm.cpvUSD}`:` $${bm.cpv}`} src={bm.src.cpv}/>
              <Chip label="ROI"  value={fp(roi)}      stat={st(roi,bm.roi)}   bench={`${bm.roi}%`}     src={bm.src.roi}/>
              <Chip label="ROAS" value={fx(roas)}     stat={st(roas,bm.roas)} bench={`${bm.roas}x`}    src={bm.src.roas}/>
            </div>
            <div style={{background:"white",borderRadius:11,padding:"11px 14px",border:"1px solid #e2e8f0",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>Nivel DIKW</span><span style={{fontSize:11,fontWeight:800,color:"#0f172a"}}>{dLabel}</span></div>
              <div style={{height:6,background:"#e2e8f0",borderRadius:3}}><div style={{width:`${(dScore/5)*100}%`,height:"100%",background:"linear-gradient(90deg,#3b82f6,#8b5cf6)",borderRadius:3,transition:"width .8s ease"}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>{["D","I","K","K+","W"].map((l,i)=><span key={l} style={{fontSize:8,fontWeight:700,color:i<dScore?"#0f172a":"#cbd5e1"}}>{l}</span>)}</div>
            </div>
          </>}

          <button onClick={run} disabled={!canRun||loading} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",background:canRun?"linear-gradient(135deg,#1e40af,#3b82f6)":"#e2e8f0",color:canRun?"white":"#94a3b8",fontSize:13,fontWeight:800,cursor:canRun?"pointer":"default",marginBottom:5}}>
            {loading?"⏳  Generando diagnóstico...":"Generar Diagnóstico con IA →"}
          </button>
          {!canRun&&<div style={{textAlign:"center",fontSize:10,color:"#94a3b8"}}>Completa Inversión, Ingreso y Conversiones en al menos un canal</div>}

          {(loading||diag||err)&&<div style={{background:"white",borderRadius:13,padding:"18px 20px",border:"1px solid #e2e8f0",marginTop:14}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:loading?"#f59e0b":"#22c55e"}} className={loading?"pulse":""}/>
              <span style={{fontSize:12,fontWeight:800,fontFamily:"Georgia,serif"}}>{loading?"Analizando con IA...":"Diagnóstico Estratégico"}</span>
              <span style={{marginLeft:"auto",fontSize:8,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>DIKW + DMAIC</span>
            </div>
            {loading&&<div style={{textAlign:"center",padding:"20px 0",color:"#94a3b8"}}><div style={{fontSize:22,marginBottom:6}}>⚡</div><div style={{fontSize:12,fontWeight:600}}>Procesando {ac.length} canal{ac.length>1?"es":""}...</div></div>}
            {err&&<div style={{padding:"10px 13px",background:"#fef2f2",borderRadius:7,color:"#ef4444",fontSize:11,fontWeight:600}}>{err}</div>}
            {diag&&!loading&&<>
              <MDR text={diag}/>
              <div className="np" style={{display:"flex",gap:8,marginTop:14}}>
                <button onClick={()=>{const t=`Metrics Decision Hub — ${MODELO_FULL[mod]} (${mes})\nROI:${fp(roi)} ROAS:${fx(roas)} CVR:${fp(cvr)}\nDIKW:${dLabel}\nUDD/Zigna Marketing Metrics`;if(navigator.share)navigator.share({title:"Metrics Decision Hub",text:t});else{navigator.clipboard.writeText(t);alert("Copiado");}}} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:"#0f172a",color:"white",fontSize:11,fontWeight:700,cursor:"pointer"}}>Compartir ↗</button>
                <button onClick={()=>window.print()} style={{flex:1,padding:"9px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"white",color:"#334155",fontSize:11,fontWeight:700,cursor:"pointer"}}>🖨 Imprimir</button>
              </div>
            </>}
          </div>}
        </div>}

        {/* ── TAB BENCH ── */}
        {tab==="bench"&&<div className="fu">
          <div style={{background:"white",borderRadius:13,padding:20,border:"1px solid #e2e8f0",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color:"#0f172a",marginBottom:14,fontFamily:"Georgia,serif"}}>⚡ 1. Fórmulas de Ingeniería de Marketing</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Salud Financiera","Ratio = CLV / CAC ≥ 3","#22c55e","Un ratio <3:1 indica agotamiento de capital; >5:1 sugiere subinversión en canales escalables."],["Brecha de Atribución","Brecha = (Conv.Ads − Ventas.Reales) / Ventas.Reales","#ef4444","Detecta sobreatribución algorítmica donde las plataformas se adjudican mérito excesivo."],["ROAS","ROAS = Ingresos / Costo Campaña","#3b82f6","No considera costos fijos. Un ROAS alto no siempre indica rentabilidad real."],["CAC","CAC = Inversión Total / Nuevos Clientes","#8b5cf6","Si CAC > margen primera venta, dependes totalmente de la retención."]].map(([t,f,c,d])=>(
                <div key={t} style={{background:"#f8fafc",borderRadius:9,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#334155",marginBottom:6}}>{t}</div>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:c,background:"#0f172a",padding:"5px 9px",borderRadius:5,marginBottom:6,wordBreak:"break-word"}}>{f}</div>
                  <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"white",borderRadius:13,padding:20,border:"1px solid #e2e8f0",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color:"#0f172a",marginBottom:12,fontFamily:"Georgia,serif"}}>📊 2. Enciclopedia de Benchmarks (2024-2026)</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Métrica Global","Promedio Base","Benchmark Destacado","Fuente"].map((h,i)=><th key={i} style={{padding:"7px 11px",textAlign:"left",fontSize:9,fontWeight:700,color:"#334155",borderBottom:"2px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                <tbody>{BENCH_ROWS.map((row,ri)=><tr key={ri} style={{borderBottom:"1px solid #f1f5f9"}}>{row.map((c,ci)=><td key={ci} style={{padding:"7px 11px",fontSize:11,color:ci===2?"#22c55e":ci===3?"#94a3b8":"#334155",fontWeight:ci===2?700:ci===0?600:400}}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[["📈 Botón de los $300M (Jared Spool)",'Ecommerce mayorista forzaba registro antes del pago. Reemplazar "Register" por "Continue as Guest" eliminó la fricción principal.',"Conversiones +45%. $15M extra el primer mes, $300M al año."],["📉 Sobreatribución (Caso FitLife)","Facebook se atribuía 40% de las ventas por last-click. Al apagar campañas, ventas solo cayeron 1.5%.","Gran parte del ROAS era orgánico canibalizado. Urgencia de medir ROI incremental real."]].map(([t,b,imp])=>(
              <div key={t} style={{background:"white",borderRadius:11,padding:"15px 17px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#0f172a",marginBottom:6}}>{t}</div>
                <div style={{fontSize:11,color:"#475569",lineHeight:1.5,marginBottom:8}}>{b}</div>
                <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:6,padding:"6px 9px"}}>
                  <div style={{fontSize:9,fontWeight:700,color:"#22c55e",marginBottom:2}}>Impacto:</div>
                  <div style={{fontSize:11,color:"#475569",lineHeight:1.4}}>{imp}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{background:"white",borderRadius:13,padding:20,border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#0f172a",marginBottom:14,fontFamily:"Georgia,serif"}}>🔀 3. Marcos de Decisión Estratégica</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,marginBottom:8}}>Modelo DIKW</div>
                {[["D","Datos","Números crudos sin contexto. Ej: 200 clicks."],["I","Información","Datos contextualizados. Ej: CVR 7.5% en verano."],["K","Conocimiento",'Interconexión para responder el "cómo".'],["W","Sabiduría",'El "por qué" del cambio estructural de negocio.']].map(([l,t,d])=>(
                  <div key={l} style={{display:"flex",gap:7,marginBottom:7}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:"#3b82f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"white",flexShrink:0}}>{l}</div>
                    <div><div style={{fontSize:11,fontWeight:700,color:"#0f172a"}}>{t}</div><div style={{fontSize:10,color:"#64748b"}}>{d}</div></div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,marginBottom:4}}>Ciclo DMAIC (Six Sigma)</div>
                <div style={{fontSize:10,color:"#64748b",marginBottom:8}}>Para optimizar ineficiencias operativas.</div>
                {[["D","Definir","El problema desde la perspectiva del usuario."],["M","Medir","Establecer línea base actual."],["A","Analizar","Causa raíz con desagregación y Benchmarks."],["I","Mejorar","Soluciones para corregir fricción detectada."],["C","Controlar","Sostenibilidad de las mejoras."]].map(([l,p,d])=>(
                  <div key={l} style={{display:"flex",gap:6,marginBottom:6}}>
                    <div style={{width:15,height:15,borderRadius:3,background:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"white",flexShrink:0,marginTop:1}}>{l}</div>
                    <div><div style={{fontSize:11,fontWeight:700,color:"#0f172a"}}>{p}</div><div style={{fontSize:10,color:"#64748b"}}>{d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>}

        {/* ── TAB ABOUT ── */}
        {tab==="about"&&<div className="fu">
          <div style={{textAlign:"center",padding:"20px 0 28px"}}>
            <div style={{width:44,height:44,background:"#f1f5f9",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:18}}>📖</div>
            <h1 style={{fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:6,fontFamily:"Georgia,serif"}}>Filosofía Operativa</h1>
            <p style={{fontSize:11,color:"#64748b",maxWidth:480,margin:"0 auto",lineHeight:1.7}}>Nuestra misión es erradicar el sesgo emocional en las decisiones de negocio. Bienvenido a un entorno de <strong style={{color:"#0f172a"}}>Decision Intelligence</strong> construido con matemática transparente e IA fundamentada.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[
              {icon:"⚡",t:"1. Propósito y Modo de Uso",c:<div><p style={{fontSize:11,color:"#475569",lineHeight:1.6,marginBottom:8}}>Simulador estratégico multi-canal. Inyecta datos reales y entiende el peso económico de cada ineficiencia en tu embudo.</p>{["Selecciona modelo (B2C/B2B/SaaS) y moneda (CLP/USD).","Agrega todos los canales activos para construir el modelo de atribución.","Completa datos de cada canal: inversión, alcance, clics, conversiones, ingreso.","Genera diagnóstico IA para saber qué canal manda y dónde está la fricción."].map((s,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:5}}><div style={{width:16,height:16,background:"#0f172a",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"white",flexShrink:0}}>{i+1}</div><div style={{fontSize:11,color:"#475569",lineHeight:1.4}}>{s}</div></div>)}</div>},
              {icon:"📋",t:"2. Fuentes de Información",c:<div><p style={{fontSize:11,color:"#475569",lineHeight:1.6,marginBottom:8}}>Benchmarks basados en fuentes 2024–2026:</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{["Baymard Institute","Gartner/McKinsey","Shopify Data","Adobe Digital","Salesforce","HubSpot"].map(s=><div key={s} style={{background:"#f8fafc",borderRadius:5,padding:"5px 8px",fontSize:10,fontWeight:700,color:"#334155",textAlign:"center",border:"1px solid #e2e8f0"}}>{s}</div>)}</div></div>},
              {icon:"🛡️",t:"3. Gobernanza de Datos",c:<div><div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:6,padding:"7px 10px",marginBottom:7}}><div style={{fontSize:9,fontWeight:800,color:"#22c55e",marginBottom:2}}>Cero Captura de PII</div><div style={{fontSize:11,color:"#475569",lineHeight:1.5}}><strong>No procesa ni transmite</strong> información personal de tus clientes, emails, tarjetas ni nombres de empresa.</div></div><p style={{fontSize:11,color:"#475569",lineHeight:1.5}}>Solo flujos matemáticos anónimos agregados a un <strong>Benchmark Colectivo Central</strong> en Firebase.</p></div>},
              {icon:"🤖",t:"4. Copiloto IA",c:<div><p style={{fontSize:11,color:"#475569",lineHeight:1.5,marginBottom:8}}><strong>Estratega de Datos Senior</strong> embebido — no genera textos superficiales.</p>{[["🔍","Modelo de Atribución","Identifica el canal con mejor ROI incremental real vs atribuido."],["📐","Validación Matemática","Compara métricas vs benchmarks 2024–2026 y alerta fricción."],["⚡","Motor: Gemini 1.5 Flash","Via Netlify Functions. Cero costo por diagnóstico para alumnos UDD."]].map(([i,tt,d])=><div key={tt} style={{display:"flex",gap:6,marginBottom:6}}><span style={{fontSize:12}}>{i}</span><div><div style={{fontSize:11,fontWeight:700,color:"#ef4444"}}>{tt}</div><div style={{fontSize:10,color:"#64748b"}}>{d}</div></div></div>)}</div>},
            ].map(card=><div key={card.t} style={{background:"white",borderRadius:12,padding:"16px 18px",border:"1px solid #e2e8f0"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><span>{card.icon}</span><h3 style={{fontSize:11,fontWeight:800,color:"#0f172a"}}>{card.t}</h3></div>{card.c}</div>)}
          </div>
          <div style={{background:"white",borderRadius:10,padding:"11px 16px",border:"1px solid #e2e8f0",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#94a3b8"}}><strong style={{color:"#334155"}}>Metrics Decision Hub</strong> · Programa <strong style={{color:"#334155"}}>Marketing Metrics — UDD / Zigna</strong> · Motor: Gemini 1.5 Flash (Netlify) · DB: Firebase Firestore · Sin costo para alumnos.</div>
          </div>
        </div>}

      </div>
    </main>
  </div>;
}
