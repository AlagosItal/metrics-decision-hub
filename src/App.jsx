import { useState } from "react";

const USD_CLP = 960;
const BM = {
  "B2C": { ctr:2.5, cvr:2.8, roi:150, roas:4.0, cpv:800,   cpvUSD:0.83,  src:{ctr:"Shopify 2025",cvr:"Baymard 2024",roi:"Nielsen 2025",roas:"Meta Insights",cpv:"eMarketer 2024"} },
  "B2B": { ctr:1.8, cvr:1.2, roi:120, roas:3.0, cpv:2500,  cpvUSD:2.60,  src:{ctr:"HubSpot 2025",cvr:"Salesforce",roi:"Gartner 2024",roas:"LinkedIn B2B",cpv:"HubSpot 2025"} },
  "SaaS":{ ctr:3.0, cvr:4.5, roi:200, roas:5.5, cpv:400,   cpvUSD:0.42,  src:{ctr:"WordStream 2025",cvr:"OpenView 2024",roi:"McKinsey",roas:"G2/Capterra",cpv:"ProfitWell 2024"} },
};
const MODELOS_FULL = { "B2C":"B2C (Ecommerce)", "B2B":"B2B (Leads)", "SaaS":"SaaS (Suscripciones)" };
const CANALES_LIST = ["Meta Ads","Google Ads","Email Marketing","SEO / Orgánico","TikTok Ads","LinkedIn Ads","Otro"];
const TABS = [{id:"input",icon:"⚡",label:"Strategy Engine"},{id:"bench",icon:"📊",label:"Metodología & Bench"},{id:"about",icon:"📖",label:"Filosofía"}];
const BENCH_ROWS = [
  ["Tasa Conv. Global (B2C)","1.8%–2.5%","4.1%–6.5% (High Intent)","Shopify, Adobe (2025)"],
  ["ROAS Meta Ads","2.8x","4.5x (ofertas >25%)","Nielsen, Facebook Insights"],
  ["ROAS Google Search","3.5x","4.8x (Long-Tail)","Salesforce, Semrush"],
  ["Abandono Carrito","70.19%","20% mejora optimizando checkout","Baymard Institute (2024)"],
  ["Costo Clic B2B","$100–$350 USD","$50 USD (Gated Content)","HubSpot SoM 2025"],
];

const nv=(v)=>parseFloat(v)||0;
const safe=(v)=>isNaN(v)||!isFinite(v)?null:v;
const fp=(v)=>v==null?"—":`${Number(v).toLocaleString("es-CL",{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
const fx=(v)=>v==null?"—":`${Number(v).toLocaleString("es-CL",{minimumFractionDigits:1,maximumFractionDigits:1})}x`;
const fm=(v,cur)=>v==null?"—":cur==="USD"?`$${(v/USD_CLP).toFixed(2)}`:`$${Math.round(v).toLocaleString("es-CL")}`;
const st=(v,b,hi=true)=>{if(v==null||b==null)return"n";const r=v/b;return hi?(r>=1.05?"ok":r>=0.75?"w":"b"):(r<=0.95?"ok":r<=1.25?"w":"b");};
const SC={ok:"#10b981",w:"#f59e0b",b:"#ef4444",n:"#6b7280"};
const SL={ok:"↑ Sobre benchmark",w:"→ En rango",b:"↓ Bajo benchmark",n:"—"};
const er=()=>({inv:"",alc:"",cli:"",conv:"",ing:""});

function KPI({label,value,stat,bench,src}){
  const c=SC[stat];
  return(
    <div style={{background:"#1e293b",border:`1px solid ${c}33`,borderRadius:10,padding:"14px 16px",borderTop:`3px solid ${c}`}}>
      <div style={{fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:"#f1f5f9",fontFamily:"Georgia,serif",marginBottom:4}}>{value}</div>
      <div style={{fontSize:10,color:c,fontWeight:600,marginBottom:3}}>{SL[stat]}</div>
      {bench&&<div style={{fontSize:9,color:"#475569"}}>Bench: <b style={{color:"#94a3b8"}}>{bench}</b> · {src}</div>}
    </div>
  );
}

function MDR({text}){
  const lines=text.split("\n"),out=[];let rows=[],inT=false,k=0;
  const flush=()=>{
    if(rows.length<2){rows=[];inT=false;return;}
    const hh=rows[0].split("|").map(s=>s.trim()).filter(Boolean);
    const bb=rows.slice(2).filter(r=>r.trim()&&!/^[\|\s\-:]+$/.test(r));
    out.push(
      <div key={k++} style={{overflowX:"auto",margin:"10px 0",borderRadius:8,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
          <thead><tr>{hh.map((h,i)=><th key={i} style={{background:"#0f172a",color:"#38bdf8",padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{bb.map((row,ri)=>{const cc=row.split("|").map(s=>s.trim()).filter(Boolean);return<tr key={ri} style={{background:ri%2===0?"#1e293b":"#162032"}}>{cc.map((c,ci)=><td key={ci} style={{padding:"8px 12px",borderBottom:"1px solid #1e293b",color:"#cbd5e1",fontSize:12}}>{c}</td>)}</tr>;})}</tbody>
        </table>
      </div>
    );
    rows=[];inT=false;
  };
  for(const line of lines){
    if(line.startsWith("|")){inT=true;rows.push(line);}
    else{
      if(inT)flush();
      if(line.startsWith("## "))      out.push(<h3 key={k++} style={{fontSize:13,fontWeight:800,color:"#38bdf8",margin:"18px 0 8px",paddingBottom:6,borderBottom:"1px solid #1e293b",letterSpacing:"0.02em"}}>{line.slice(3)}</h3>);
      else if(line.startsWith("# ")) out.push(<h2 key={k++} style={{fontSize:16,fontWeight:800,color:"#f1f5f9",margin:"8px 0 6px"}}>{line.slice(2)}</h2>);
      else if(/^[-*] /.test(line))   out.push(<li key={k++} style={{fontSize:12,color:"#94a3b8",margin:"3px 0 3px 14px",lineHeight:1.6}}>{line.slice(2)}</li>);
      else if(line.trim())           out.push(<p  key={k++} style={{fontSize:12,color:"#94a3b8",margin:"3px 0",lineHeight:1.7}}>{line}</p>);
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
  const [menuOpen,setMenuOpen]=useState(false);

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
  const cpvB=cur==="USD"?bm.cpvUSD*USD_CLP:bm.cpv;
  const dScore=[ctr,cvr,roi,roas,cpv].filter(v=>v!=null).length;
  const dLabel=["Dato Bruto","Información","Conocimiento","Conocimiento Avanzado","Sabiduría Estratégica"][Math.min(dScore,4)];
  const canRun=tI>0&&tG>0&&tV>0;

  const addC=(name)=>{if(!canales[name])setCanales(p=>({...p,[name]:er()}));};
  const delC=(name)=>{if(ac.length===1)return;const n={...canales};delete n[name];setCanales(n);};
  const upd=(name,f,v)=>setCanales(p=>({...p,[name]:{...p[name],[f]:v}}));
  const cMet=(name)=>{
    const r=canales[name];
    const i=toClp(r.inv),g=toClp(r.ing),c=nv(r.cli),v=nv(r.conv);
    return{roas:safe(i>0?g/i:null),roi:safe(i>0?((g-i)/i)*100:null),cvr:safe(c>0?(v/c)*100:null)};
  };

  async function run(){
    if(!canRun)return;
    setLoading(true);setErr("");setDiag("");
    const breakdown=ac.map(name=>{
      const r=canales[name];const m=cMet(name);
      return `  ${name}: Inv=${fm(toClp(r.inv),"CLP")} CLP | Ing=${fm(toClp(r.ing),"CLP")} CLP | Clics=${nv(r.cli)} | Conv=${nv(r.conv)} | ROAS=${fx(m.roas)} | ROI=${fp(m.roi)} | CVR=${fp(m.cvr)}`;
    }).join("\n");
    const ud=`MODELO: ${MODELOS_FULL[mod]} | MONEDA: ${cur} | PERÍODO: ${mes}\nCANALES:\n${breakdown}\nTOTALES: Inv=${fm(tI,"CLP")} CLP | Ing=${fm(tG,"CLP")} CLP | CTR=${fp(ctr)}(bench ${bm.ctr}%) | CVR=${fp(cvr)}(bench ${bm.cvr}%) | CPV=${fm(cpv,"CLP")} CLP(bench $${bm.cpv}) | ROI=${fp(roi)}(bench ${bm.roi}%) | ROAS=${fx(roas)}(bench ${bm.roas}x) | DIKW=${dLabel}`;
    try{
      const res=await fetch("/.netlify/functions/gemini",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({userData:ud})
      });
      if(!res.ok){const e=await res.json();throw new Error(e?.error||JSON.stringify(e));}
      const data=await res.json();
      if(data?.text){setDiag(data.text);setSaved(true);}
      else setErr("Sin respuesta de la IA. Intenta nuevamente.");
    }catch(e){setErr(`Error: ${e.message}`);}
    finally{setLoading(false);}
  }

  const iStyle={width:"100%",padding:"9px 12px",borderRadius:7,border:"1px solid #334155",background:"#0f172a",color:"#f1f5f9",fontSize:13,fontWeight:600,outline:"none",transition:"border .2s"};

  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html{font-size:16px}
    body{background:#0a0f1e;color:#f1f5f9;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
    button,input,select{font-family:inherit}
    input:focus{border-color:#38bdf8!important;box-shadow:0 0 0 3px #38bdf820}
    select:focus{outline:none;border-color:#38bdf8!important}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fu{animation:fadeUp .35s ease forwards}
    .pulse{animation:pulse 1.4s infinite}
    .spin{animation:spin 1s linear infinite}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:#0f172a}
    ::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}
    @media print{.np{display:none!important}body{background:white;color:black}}

    /* MOBILE */
    @media(max-width:768px){
      .sidebar{display:none!important}
      .sidebar.open{display:flex!important;position:fixed;top:0;left:0;width:260px;height:100vh;z-index:200;box-shadow:4px 0 24px #000a}
      .main-pad{padding:16px 14px!important}
      .topbar{padding:0 14px!important}
      .grid2{grid-template-columns:1fr!important}
      .grid5{grid-template-columns:1fr 1fr!important}
      .canal-grid{grid-template-columns:1fr!important}
      .mob-hide{display:none!important}
      .modelo-btns{flex-wrap:wrap!important}
      .modelo-btns button{flex:1;min-width:0;font-size:11px!important;padding:7px 8px!important}
    }
    @media(max-width:480px){
      .grid5{grid-template-columns:1fr!important}
    }
    .overlay{display:none;position:fixed;inset:0;background:#000a;z-index:150}
    .overlay.open{display:block}
  `;

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#0a0f1e"}}>
      <style>{css}</style>

      {/* Mobile overlay */}
      <div className={`overlay${menuOpen?" open":""}`} onClick={()=>setMenuOpen(false)}/>

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar np`} style={{width:220,background:"#0d1424",borderRight:"1px solid #1e293b",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflow:"auto",flexShrink:0}}>
        <div style={{padding:"20px 16px 14px",borderBottom:"1px solid #1e293b"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4}}>
            <div style={{width:28,height:28,background:"linear-gradient(135deg,#38bdf8,#6366f1)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.02em"}}>MetricsHub</div>
              <div style={{fontSize:9,color:"#475569",fontWeight:600,letterSpacing:"0.04em"}}>UDD · Zigna</div>
            </div>
          </div>
          <div style={{fontSize:9,color:"#334155",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:6}}>{MODELOS_FULL[mod].split(" ")[0]} · {mes}</div>
        </div>

        <nav style={{padding:"10px 8px",flex:1}}>
          <div style={{fontSize:9,fontWeight:700,color:"#334155",letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 10px 6px"}}>NAVIGATION</div>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setMenuOpen(false);}} style={{width:"100%",textAlign:"left",padding:"9px 11px",borderRadius:8,border:"none",background:tab===t.id?"#1e293b":"transparent",color:tab===t.id?"#f1f5f9":"#64748b",fontSize:12,fontWeight:tab===t.id?700:500,display:"flex",alignItems:"center",gap:8,marginBottom:2,cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:13}}>{t.icon}</span>{t.label}
              {tab===t.id&&<div style={{marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:"#38bdf8"}}/>}
            </button>
          ))}
        </nav>

        <div style={{padding:"12px 16px",borderTop:"1px solid #1e293b"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#334155",letterSpacing:"0.1em",marginBottom:6,textTransform:"uppercase"}}>AI ENGINE</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:loading?"#f59e0b":"#10b981",flexShrink:0}} className={loading?"pulse":""}/>
            <span style={{fontSize:10,color:"#64748b"}}>{loading?"Procesando...":"Operational"}</span>
          </div>
          <div style={{fontSize:9,color:"#1e293b",background:"#1e293b",borderRadius:4,padding:"3px 7px",display:"inline-block",color:"#38bdf8",marginTop:2}}>Gemini 2.0 Flash</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,background:"#0a0f1e",overflow:"auto",minWidth:0}}>

        {/* Topbar */}
        <div className="topbar np" style={{background:"#0d1424",borderBottom:"1px solid #1e293b",padding:"0 24px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Hamburger mobile */}
            <button onClick={()=>setMenuOpen(v=>!v)} style={{display:"none",background:"none",border:"none",color:"#64748b",cursor:"pointer",padding:4}} className="mob-menu-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.01em"}}>{TABS.find(t=>t.id===tab)?.label}</div>
              <div style={{fontSize:9,color:"#334155",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>{MODELOS_FULL[mod].split(" ")[0]} · {mes} · {ac.length} canal{ac.length>1?"es":""}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {saved&&<span style={{fontSize:9,color:"#10b981",fontWeight:700,background:"#10b98115",padding:"2px 8px",borderRadius:4,border:"1px solid #10b98133"}}>✓ Guardado</span>}
            <div style={{display:"flex",background:"#1e293b",borderRadius:7,padding:2,gap:1}}>
              {["CLP","USD"].map(c=>(
                <button key={c} onClick={()=>setCur(c)} style={{padding:"3px 9px",borderRadius:5,border:"none",background:cur===c?"#38bdf8":"transparent",color:cur===c?"#0f172a":"#64748b",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="main-pad" style={{padding:"24px 28px",maxWidth:1000,margin:"0 auto"}}>

          {/* ══ TAB: STRATEGY ENGINE ══ */}
          {tab==="input"&&(
            <div className="fu">

              {/* Modelo + período */}
              <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,marginBottom:20,alignItems:"end"}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#475569",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:7}}>Modelo de Negocio</div>
                  <div className="modelo-btns" style={{display:"flex",gap:6}}>
                    {["B2C","B2B","SaaS"].map(m=>(
                      <button key={m} onClick={()=>setMod(m)} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${mod===m?"#38bdf8":"#1e293b"}`,background:mod===m?"#38bdf810":"transparent",color:mod===m?"#38bdf8":"#64748b",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .18s"}}>
                        {MODELOS_FULL[m]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#475569",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:7}}>Período</div>
                  <input value={mes} onChange={e=>setMes(e.target.value)} placeholder="Q3 2025" style={{...iStyle,width:130}}/>
                </div>
              </div>

              {/* Canales */}
              <div style={{background:"#0d1424",borderRadius:12,padding:"18px",border:"1px solid #1e293b",marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>Canales Activos</span>
                    <span style={{fontSize:10,color:"#475569",marginLeft:6}}>modelo atribución multi-canal</span>
                  </div>
                  <select onChange={e=>{if(e.target.value){addC(e.target.value);e.target.value=""}}} defaultValue="" style={{...iStyle,width:"auto",padding:"6px 12px",color:"#38bdf8",border:"1px solid #38bdf833",fontSize:11,fontWeight:700}}>
                    <option value="" disabled>+ Agregar canal</option>
                    {CANALES_LIST.filter(c=>!canales[c]).map(c=><option key={c} style={{background:"#0f172a"}}>{c}</option>)}
                  </select>
                </div>

                {ac.map(name=>{
                  const m=cMet(name);
                  return(
                    <div key={name} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 16px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <div style={{width:7,height:7,borderRadius:"50%",background:"#38bdf8",flexShrink:0}}/>
                          <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{name}</span>
                          {m.roas!=null&&<span style={{fontSize:10,fontWeight:700,color:m.roas>=bm.roas?"#10b981":"#ef4444",background:m.roas>=bm.roas?"#10b98115":"#ef444415",padding:"2px 7px",borderRadius:4,border:`1px solid ${m.roas>=bm.roas?"#10b98133":"#ef444433"}`}}>ROAS {fx(m.roas)}</span>}
                          {m.roi!=null&&<span style={{fontSize:10,fontWeight:700,color:m.roi>=bm.roi?"#10b981":"#ef4444",background:m.roi>=bm.roi?"#10b98115":"#ef444415",padding:"2px 7px",borderRadius:4,border:`1px solid ${m.roi>=bm.roi?"#10b98133":"#ef444433"}`}}>ROI {fp(m.roi)}</span>}
                        </div>
                        {ac.length>1&&<button onClick={()=>delC(name)} style={{border:"none",background:"none",color:"#ef4444",fontSize:16,cursor:"pointer",opacity:.7,lineHeight:1}}>×</button>}
                      </div>
                      <div className="canal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        {[["inv",`Inversión (${cur})`],["ing",`Ingreso (${cur})`],["alc","Alcance / Impresiones"],["cli","Clics"]].map(([k,l])=>(
                          <div key={k}>
                            <label style={{fontSize:9,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:3}}>{l}</label>
                            <input type="number" min="0" value={canales[name][k]} onChange={e=>upd(name,k,e.target.value)} style={iStyle} onFocus={e=>e.target.style.borderColor="#38bdf8"} onBlur={e=>e.target.style.borderColor="#334155"}/>
                          </div>
                        ))}
                        <div style={{gridColumn:"1/-1"}}>
                          <label style={{fontSize:9,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:3}}>Conversiones</label>
                          <input type="number" min="0" value={canales[name].conv} onChange={e=>upd(name,"conv",e.target.value)} style={iStyle} onFocus={e=>e.target.style.borderColor="#38bdf8"} onBlur={e=>e.target.style.borderColor="#334155"}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* KPIs */}
              {dScore>0&&(
                <>
                  <div className="grid5" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12}}>
                    <KPI label="CTR"  value={fp(ctr)}     stat={st(ctr,bm.ctr)}    bench={`${bm.ctr}%`}       src={bm.src.ctr}/>
                    <KPI label="CVR"  value={fp(cvr)}     stat={st(cvr,bm.cvr)}    bench={`${bm.cvr}%`}       src={bm.src.cvr}/>
                    <KPI label="CPV"  value={`${fm(cpv,cur)} ${cur}`} stat={st(cpv,cpvB,false)} bench={cur==="USD"?`$${bm.cpvUSD}`:`$${bm.cpv}`} src={bm.src.cpv}/>
                    <KPI label="ROI"  value={fp(roi)}     stat={st(roi,bm.roi)}    bench={`${bm.roi}%`}       src={bm.src.roi}/>
                    <KPI label="ROAS" value={fx(roas)}    stat={st(roas,bm.roas)}  bench={`${bm.roas}x`}      src={bm.src.roas}/>
                  </div>

                  {/* DIKW */}
                  <div style={{background:"#0d1424",borderRadius:10,padding:"13px 16px",border:"1px solid #1e293b",marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                      <span style={{fontSize:9,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em"}}>Nivel DIKW</span>
                      <span style={{fontSize:11,fontWeight:700,color:"#38bdf8"}}>{dLabel}</span>
                    </div>
                    <div style={{height:5,background:"#1e293b",borderRadius:3}}>
                      <div style={{width:`${(dScore/5)*100}%`,height:"100%",background:"linear-gradient(90deg,#38bdf8,#6366f1)",borderRadius:3,transition:"width .8s ease"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                      {["D","I","K","K+","W"].map((l,i)=><span key={l} style={{fontSize:9,fontWeight:700,color:i<dScore?"#38bdf8":"#1e293b"}}>{l}</span>)}
                    </div>
                  </div>
                </>
              )}

              {/* CTA */}
              <button onClick={run} disabled={!canRun||loading} style={{width:"100%",padding:"14px",borderRadius:10,border:"none",background:canRun?"linear-gradient(135deg,#38bdf8,#6366f1)":"#1e293b",color:canRun?"#0f172a":"#334155",fontSize:14,fontWeight:800,cursor:canRun?"pointer":"default",transition:"all .2s",marginBottom:6,letterSpacing:"-0.01em"}}>
                {loading?(
                  <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Generando diagnóstico con Gemini AI...
                  </span>
                ):"Generar Diagnóstico con IA →"}
              </button>
              {!canRun&&<div style={{textAlign:"center",fontSize:10,color:"#334155",marginBottom:4}}>Completa Inversión, Ingreso y Conversiones en al menos un canal</div>}

              {/* Resultado */}
              {(loading||diag||err)&&(
                <div style={{background:"#0d1424",borderRadius:12,padding:"20px",border:"1px solid #1e293b",marginTop:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14,flexWrap:"wrap"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:loading?"#f59e0b":"#10b981",flexShrink:0}} className={loading?"pulse":""}/>
                    <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9",fontFamily:"'DM Serif Display',Georgia,serif"}}>{loading?"Analizando datos...":"Diagnóstico Estratégico"}</span>
                    <span style={{marginLeft:"auto",fontSize:9,color:"#334155",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Gemini 2.0 Flash · DIKW + DMAIC</span>
                  </div>
                  {loading&&(
                    <div style={{textAlign:"center",padding:"28px 0",color:"#334155"}}>
                      <div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Procesando {ac.length} canal{ac.length>1?"es":""} y generando modelo de atribución...</div>
                      <div style={{fontSize:10}}>10–20 segundos</div>
                    </div>
                  )}
                  {err&&<div style={{padding:"12px 14px",background:"#ef444415",border:"1px solid #ef444433",borderRadius:8,color:"#ef4444",fontSize:12,fontWeight:600,lineHeight:1.5}}>{err}</div>}
                  {diag&&!loading&&(
                    <>
                      <MDR text={diag}/>
                      <div className="np" style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
                        <button onClick={()=>{const t=`Metrics Decision Hub — ${MODELOS_FULL[mod]} (${mes})\nROI:${fp(roi)} | ROAS:${fx(roas)} | CVR:${fp(cvr)}\nDIKW: ${dLabel}\nmktgmetrics.netlify.app`;if(navigator.share)navigator.share({title:"Metrics Decision Hub",text:t,url:"https://mktgmetrics.netlify.app"});else{navigator.clipboard.writeText(t);alert("Copiado al portapapeles");}}} style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #1e293b",background:"#1e293b",color:"#f1f5f9",fontSize:12,fontWeight:700,cursor:"pointer",minWidth:120}}>
                          Compartir ↗
                        </button>
                        <button onClick={()=>window.print()} style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #1e293b",background:"transparent",color:"#64748b",fontSize:12,fontWeight:700,cursor:"pointer",minWidth:120}}>
                          🖨 Imprimir / PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: BENCH ══ */}
          {tab==="bench"&&(
            <div className="fu">
              <div style={{background:"#0d1424",borderRadius:12,padding:22,border:"1px solid #1e293b",marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:"#38bdf8",marginBottom:16}}>⚡ 1. Fórmulas de Ingeniería de Marketing</div>
                <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[["Salud Financiera (Gartner)","Ratio = CLV / CAC ≥ 3","#10b981","<3:1 indica agotamiento de capital. >5:1 sugiere subinversión en canales escalables."],
                    ["Brecha de Atribución","Brecha = (Conv.Ads − Ventas.Reales) / Ventas.Reales","#ef4444","Detecta sobreatribución algorítmica. Las plataformas se adjudican mérito excesivo en retargeting."],
                    ["ROAS","ROAS = Ingresos / Costo Campaña","#38bdf8","No considera costos fijos de producto. ROAS alto no siempre implica rentabilidad real."],
                    ["CAC","CAC = Inversión Total / Nuevos Clientes","#6366f1","Si CAC > margen primera venta, el negocio depende totalmente de la retención para sobrevivir."],
                  ].map(([t,f,c,d])=>(
                    <div key={t} style={{background:"#0f172a",borderRadius:9,padding:"14px 16px",border:"1px solid #1e293b",borderTop:`2px solid ${c}`}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:8}}>{t}</div>
                      <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:c,background:"#0a0f1e",padding:"6px 10px",borderRadius:5,marginBottom:8,wordBreak:"break-word"}}>{f}</div>
                      <div style={{fontSize:11,color:"#64748b",lineHeight:1.6}}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:"#0d1424",borderRadius:12,padding:22,border:"1px solid #1e293b",marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:"#38bdf8",marginBottom:14}}>📊 2. Benchmarks por Contexto (2024-2026)</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
                    <thead><tr>{["Métrica","Base Q1-Q3","Benchmark Destacado","Fuente"].map((h,i)=><th key={i} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#475569",borderBottom:"1px solid #1e293b",whiteSpace:"nowrap",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>)}</tr></thead>
                    <tbody>{BENCH_ROWS.map((row,ri)=><tr key={ri} style={{borderBottom:"1px solid #1e293b"}}>{row.map((c,ci)=><td key={ci} style={{padding:"9px 12px",fontSize:12,color:ci===2?"#10b981":ci===3?"#334155":"#94a3b8",fontWeight:ci===0?600:ci===2?700:400}}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </div>

              <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {[["📈 Botón de los $300M (Jared Spool)",'Ecommerce mayorista forzaba registro antes del pago. Reemplazar "Register" por "Continue as Guest" eliminó la fricción principal.',"Conversiones +45%. $15M el primer mes, $300M al año. La fricción emocional pesa más que el alcance pagado."],
                  ["📉 Sobreatribución (Caso FitLife)","Facebook se atribuía 40% de ventas por last-click. Al pausar campañas, las ventas solo cayeron 1.5%.","Gran parte del ROAS era orgánico canibalizado. Urgencia de medir ROI incremental real vs atribuido."],
                ].map(([t,b,imp])=>(
                  <div key={t} style={{background:"#0d1424",borderRadius:10,padding:"16px",border:"1px solid #1e293b"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>{t}</div>
                    <div style={{fontSize:11,color:"#64748b",lineHeight:1.6,marginBottom:10}}>{b}</div>
                    <div style={{background:"#10b98110",border:"1px solid #10b98133",borderRadius:6,padding:"8px 10px"}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#10b981",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Impacto demostrado</div>
                      <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{imp}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{background:"#0d1424",borderRadius:12,padding:22,border:"1px solid #1e293b"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#38bdf8",marginBottom:14}}>🔀 3. Marcos de Decisión Estratégica</div>
                <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>Modelo DIKW</div>
                    {[["D","#38bdf8","Datos","Números crudos sin contexto. Ej: 200 clicks."],["I","#6366f1","Información","Datos contextualizados. Ej: CVR 7.5% en verano."],["K","#10b981","Conocimiento",'Interconexión para responder el "cómo".'],["W","#f59e0b","Sabiduría",'El "por qué" del cambio estructural.']].map(([l,c,t,d])=>(
                      <div key={l} style={{display:"flex",gap:9,marginBottom:10}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#0f172a",flexShrink:0,marginTop:1}}>{l}</div>
                        <div><div style={{fontSize:11,fontWeight:700,color:"#f1f5f9"}}>{t}</div><div style={{fontSize:10,color:"#64748b",lineHeight:1.4}}>{d}</div></div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>Ciclo DMAIC (Six Sigma)</div>
                    {[["D","#ef4444","Definir","El problema desde la perspectiva del usuario."],["M","#f59e0b","Medir","Establecer línea base actual."],["A","#38bdf8","Analizar","Causa raíz con desagregación y Benchmarks."],["I","#10b981","Mejorar","Soluciones para corregir fricción detectada."],["C","#6366f1","Controlar","Sostenibilidad de las mejoras a largo plazo."]].map(([l,c,p,d])=>(
                      <div key={l} style={{display:"flex",gap:8,marginBottom:8}}>
                        <div style={{width:17,height:17,borderRadius:4,background:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#0f172a",flexShrink:0,marginTop:2}}>{l}</div>
                        <div><div style={{fontSize:11,fontWeight:700,color:"#f1f5f9"}}>{p}</div><div style={{fontSize:10,color:"#64748b"}}>{d}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: ABOUT ══ */}
          {tab==="about"&&(
            <div className="fu">
              <div style={{textAlign:"center",padding:"24px 0 32px"}}>
                <div style={{width:52,height:52,background:"linear-gradient(135deg,#38bdf820,#6366f120)",border:"1px solid #38bdf833",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:22}}>📖</div>
                <h1 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",marginBottom:8,fontFamily:"'DM Serif Display',Georgia,serif"}}>Filosofía Operativa</h1>
                <p style={{fontSize:12,color:"#64748b",maxWidth:500,margin:"0 auto",lineHeight:1.8}}>Nuestra misión es erradicar el sesgo emocional en las decisiones de negocio. Bienvenido a un entorno de <strong style={{color:"#38bdf8"}}>Decision Intelligence</strong> construido con matemática transparente e IA fundamentada.</p>
              </div>

              <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                {[
                  {icon:"⚡",t:"1. Propósito y Modo de Uso",c:<div>
                    <p style={{fontSize:11,color:"#64748b",lineHeight:1.7,marginBottom:10}}>Simulador estratégico multi-canal. Inyecta datos reales y entiende el peso económico de cada ineficiencia en tu embudo de ventas.</p>
                    {["Selecciona modelo (B2C/B2B/SaaS) y moneda (CLP/USD).","Agrega todos los canales activos para construir el modelo de atribución.","Completa los datos de cada canal.","Genera diagnóstico IA — la IA identifica qué canal manda y dónde está la fricción real."].map((s,i)=>(
                      <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                        <div style={{width:17,height:17,background:"#38bdf8",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#0f172a",flexShrink:0}}>{i+1}</div>
                        <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{s}</div>
                      </div>
                    ))}
                  </div>},
                  {icon:"📋",t:"2. Fuentes de Información",c:<div>
                    <p style={{fontSize:11,color:"#64748b",lineHeight:1.7,marginBottom:10}}>Benchmarks basados en fuentes empíricas 2024–2026:</p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {["Baymard Institute","Gartner/McKinsey","Shopify Data","Adobe Digital","Salesforce","HubSpot"].map(s=>(
                        <div key={s} style={{background:"#1e293b",borderRadius:6,padding:"6px 9px",fontSize:10,fontWeight:600,color:"#94a3b8",textAlign:"center",border:"1px solid #334155"}}>{s}</div>
                      ))}
                    </div>
                  </div>},
                  {icon:"🛡️",t:"3. Gobernanza de Datos",c:<div>
                    <div style={{background:"#10b98110",border:"1px solid #10b98133",borderRadius:7,padding:"9px 12px",marginBottom:9}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#10b981",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Cero Captura de PII</div>
                      <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}><strong style={{color:"#94a3b8"}}>No procesa ni transmite</strong> información personal, emails, tarjetas ni nombres de empresa.</div>
                    </div>
                    <p style={{fontSize:11,color:"#64748b",lineHeight:1.6}}>Solo flujos matemáticos anónimos agregados a un <strong style={{color:"#94a3b8"}}>Benchmark Colectivo Central</strong> en Firebase.</p>
                  </div>},
                  {icon:"🤖",t:"4. Copiloto IA",c:<div>
                    <p style={{fontSize:11,color:"#64748b",lineHeight:1.6,marginBottom:10}}><strong style={{color:"#94a3b8"}}>Estratega de Datos Senior</strong> embebido — no genera textos superficiales.</p>
                    {[["🔍","Modelo de Atribución","Canal con mejor ROI incremental real vs atribuido."],["📐","Validación Matemática","Compara vs benchmarks 2024–2026 y alerta fricción."],["⚡","Gemini 2.0 Flash","Via Netlify Functions. Sin costo por diagnóstico."]].map(([i,tt,d])=>(
                      <div key={tt} style={{display:"flex",gap:7,marginBottom:8}}>
                        <span style={{fontSize:13,flexShrink:0}}>{i}</span>
                        <div><div style={{fontSize:11,fontWeight:700,color:"#38bdf8"}}>{tt}</div><div style={{fontSize:10,color:"#64748b"}}>{d}</div></div>
                      </div>
                    ))}
                  </div>},
                ].map(card=>(
                  <div key={card.t} style={{background:"#0d1424",borderRadius:12,padding:"18px 20px",border:"1px solid #1e293b"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
                      <span style={{fontSize:14}}>{card.icon}</span>
                      <h3 style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{card.t}</h3>
                    </div>
                    {card.c}
                  </div>
                ))}
              </div>

              <div style={{background:"#0d1424",borderRadius:10,padding:"12px 18px",border:"1px solid #1e293b",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#334155",lineHeight:1.7}}>
                  <strong style={{color:"#475569"}}>Metrics Decision Hub</strong> · Programa <strong style={{color:"#475569"}}>Marketing Metrics — UDD / Zigna</strong> · Motor: Gemini 2.0 Flash (Netlify) · DB: Firebase Firestore · Sin costo para alumnos.
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile hamburger (injected via CSS display:none override) */}
      <style>{`.mob-menu-btn{display:none!important}@media(max-width:768px){.mob-menu-btn{display:flex!important}.sidebar{transform:translateX(-100%);transition:transform .25s ease}.sidebar.open{transform:translateX(0)}}`}</style>
    </div>
  );
}
