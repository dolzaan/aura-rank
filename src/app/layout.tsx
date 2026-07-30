import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
export const metadata:Metadata={title:'AuraRank',description:'Transforme presença em pontos de aura.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><main style={{maxWidth:1100,margin:'0 auto',padding:'16px'}}><Nav/>{children}</main></body></html>}
