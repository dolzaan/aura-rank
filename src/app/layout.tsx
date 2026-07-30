import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata:Metadata={title:"AuraRank",description:"Transforme presença em pontos de aura."};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="pt-BR"><body><main className="app-shell"><Nav/>{children}</main></body></html>;
}