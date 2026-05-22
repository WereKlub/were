"use client";

import React, { createContext, useContext } from "react";

export interface NavigationSettings {
  showBlogInNavigation: boolean;
  showBoutiqueInNavigation: boolean;
  showAboutInNavigation: boolean;
  showAgencyInNavigation: boolean;
}

const defaultSettings: NavigationSettings = {
  showBlogInNavigation: true,
  showBoutiqueInNavigation: true,
  showAboutInNavigation: false,
  showAgencyInNavigation: false,
};

const NavigationSettingsContext =
  createContext<NavigationSettings>(defaultSettings);

export function NavigationSettingsProvider({
  children,
  showBlogInNavigation = true,
  showBoutiqueInNavigation = true,
  showAboutInNavigation = false,
  showAgencyInNavigation = false,
}: {
  children: React.ReactNode;
  showBlogInNavigation?: boolean;
  showBoutiqueInNavigation?: boolean;
  showAboutInNavigation?: boolean;
  showAgencyInNavigation?: boolean;
}) {
  const value: NavigationSettings = {
    showBlogInNavigation,
    showBoutiqueInNavigation,
    showAboutInNavigation,
    showAgencyInNavigation,
  };
  return (
    <NavigationSettingsContext.Provider value={value}>
      {children}
    </NavigationSettingsContext.Provider>
  );
}

export function useNavigationSettings(): NavigationSettings {
  const context = useContext(NavigationSettingsContext);
  return context ?? defaultSettings;
}
