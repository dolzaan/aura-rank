import Link from "next/link";
import { ArrowRight, Play, Sparkles, Trophy, Users, Zap } from "lucide-react";

const stats=[['12,8M','pontos farmados'],['48K','vídeos analisados'],['9,2K','ligas ativas']];
const features=[[Trophy,'Ranking em tempo real','Suba posições a cada vídeo e acompanhe sua evolução.'],[Users,'Ligas privadas','Crie disputas com amigos, creators ou sua comunidade.'],[Zap,'Análise por IA','Presença, execução, estilo e originalidade viram pontos.']];

export default function Home(){return <div className="reveal" style={{display:'grid',gap:18}}>
  <section className="panel" style={{position:'relative',overflow:'hidden',padding:'clamp(28px,6vw,78px)',minHeight:620,display:'grid',alignItems:'center'}}>
    <div style={{position:'absolute',width:360,height:360,borderRadius:999,background:'rgba(199,255,50,.12)',filter:'blur(70px)',right:-100,top:-80}}/>
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.2fr) minmax(280px,.8fr)',gap:34,alignItems:'center'}}>
      <div style={{position:'relative',zIndex:2}}>
        <div className="glass" style={{display:'inline-flex',alignItems:'center',gap:8,borderRadius:999,padding:'8px 12px',fontWeight:900,fontSize:12,letterSpacing:1.4}}><Sparkles size={15} className="lime"/> SUA PRESENÇA VALE PONTOS</div>
        <h1 className="gradient-text" style={{fontSize:'clamp(54px,9vw,110px)',lineHeight:.88,letterSpacing:'-.065em',margin:'24px 0',maxWidth:850}}>Farme aura.<br/>Vire lenda.</h1>
        <p className="muted" style={{fontSize:'clamp(17px,2vw,22px)',lineHeight:1.55,maxWidth:650}}>Poste seus melhores momentos, receba uma nota da IA e dispute o topo com a comunidade.</p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:30}}><Link className="btn pulse-soft" href="/upload"><Sparkles size={18}/>Começar agora</Link><Link className="btn-secondary" style={{padding:'14px 18px',borderRadius:999,fontWeight:900}} href="/feed"><Play size={18}/>Explorar feed</Link></div>
        <div style={{display:'flex',gap:28,flexWrap:'wrap',marginTop:42}}>{stats.map(([value,label])=><div key={label}><strong style={{fontSize:24}}>{value}</strong><div className="muted" style={{fontSize:13}}>{label}</div></div>)}</div>
      </div>
      <div className="float desktop-only" style={{position:'relative',maxWidth:360,justifySelf:'center',width:'100%'}}>
        <div className="video-surface" style={{aspectRatio:'9/15',borderRadius:34,border:'1px solid rgba(255,255,255,.14)',boxShadow:'0 40px 100px rgba(0,0,0,.6)'}}>
          <div className="glass" style={{position:'absolute',top:16,left:16,right:16,borderRadius:18,padding:12,display:'flex',justifyContent:'space-between'}}><b>@dolzaan</b><span className="lime" style={{fontWeight:900}}>+847 AURA</span></div>
          <div style={{position:'absolute',left:18,right:18,bottom:20}}><div style={{fontSize:44,fontWeight:950,letterSpacing:-2}}>CONFORTO<br/><span className="lime">ABSURDO.</span></div><p style={{marginBottom:0}}>#confiança #presença</p></div>
        </div>
      </div>
    </div>
  </section>
  <section className="grid-auto">{features.map(([Icon,title,text])=><article className="panel" style={{padding:24,transition:'transform .25s ease'}} key={String(title)}><div style={{width:46,height:46,borderRadius:16,display:'grid',placeItems:'center',background:'rgba(199,255,50,.1)'}}><Icon className="lime"/></div><h2 style={{fontSize:21,marginBottom:8}}>{String(title)}</h2><p className="muted" style={{lineHeight:1.6}}>{String(text)}</p><Link href="/feed" className="lime" style={{display:'inline-flex',gap:5,alignItems:'center',fontWeight:900}}>Descobrir <ArrowRight size={16}/></Link></article>)}</section>
</div>}