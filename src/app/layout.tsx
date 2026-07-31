import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AuraRank — Sua presença vale pontos",
  description: "Poste seus melhores momentos, farme aura e dispute o topo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-dvh bg-black text-white antialiased">
        <Nav />
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
