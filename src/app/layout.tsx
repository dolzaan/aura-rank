import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AuraTok — Sua aura. Seu impacto.",
    template: "%s — AuraTok",
  },
  description:
    "A rede social onde presença vira reputação. Poste, inspire e acumule aura.",
  applicationName: "AuraTok",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-dvh bg-[#050505] text-white antialiased">
        <Nav />
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
