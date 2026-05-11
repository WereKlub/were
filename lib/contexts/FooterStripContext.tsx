"use client";

import { createContext, useContext, type ReactNode } from "react";

const FooterStripContext = createContext<string[]>([]);

export function FooterStripProvider({
  urls,
  children,
}: {
  urls: string[];
  children: ReactNode;
}) {
  return (
    <FooterStripContext.Provider value={urls}>
      {children}
    </FooterStripContext.Provider>
  );
}

export function useFooterStripUrls(): string[] {
  return useContext(FooterStripContext);
}
