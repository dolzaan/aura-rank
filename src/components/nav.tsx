"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home, Trophy, Users, Upload, UserRound } from "lucide-react";

const links=[['Feed','/feed',Flame],['Ranking','/ranking',Trophy],['Farmar','/upload',Upload],['Ligas','/ligas',Users],['Perfil','/perfil/dolzaan',UserRound]] as const;

export function Nav(){
  const pathname=usePathname();
  return <>
    <nav className="panel desktop-only" style={{position:'sticky',top:18,zIndex:30,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',marginBottom:26}}>
      <Link href="/" style={{fontWeight:950,fontSize:22,letterSpacing:-1}}>AURA<span className="lime">RANK</span></Link>
      <div style={{display:'flex',gap:6}}>{links.map(([label,href,Icon])=>{const active=pathname===href||pathname.startsWith(`${href}/`);return <Link key={href} href={href} className="btn-secondary" style={{padding:'10px 13px',borderRadius:999,background:active?'rgba(199,255,50,.13)':undefined,borderColor:active?'rgba(199,255,50,.35)':undefined,color:active?'var(--lime)':undefined}}><Icon size={17}/><span>{label}</span></Link>})}</div>
      <div className="story-ring"><div className="story-inner" style={{width:38,height:38,fontWeight:900,fontSize:12}}>PD</div></div>
    </nav>
    <nav className="mobile-only glass" aria-label="Navegação principal" style={{position:'fixed',zIndex:50,left:10,right:10,bottom:10,borderRadius:22,padding:'9px 8px',display:'grid',gridTemplateColumns:'repeat(5,1fr)'}}>
      {links.map(([label,href,Icon])=>{const active=pathname===href||pathname.startsWith(`${href}/`);return <Link key={href} href={href} aria-label={label} style={{display:'grid',placeItems:'center',gap:4,fontSize:10,fontWeight:800,color:active?'var(--lime)':'#a3a3a3'}}><Icon size={active?23:21}/><span>{label}</span></Link>})}
    </nav>
  </>;
}