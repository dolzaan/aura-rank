"use client";

import { SpectreThemeProvider } from "@spectre-ui/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SpectreThemeProvider defaultTheme="dark">
      {children}
    </SpectreThemeProvider>
  );
}
