/* eslint-disable react-refresh/only-export-components -- exports the useTheme hook alongside the provider component */
import { createContext, useContext, useState } from "react";
import type { ExcodeTheme } from "./types";
import { applyTheme } from "./applyTheme";

const themeModules = import.meta.glob<{ default: ExcodeTheme }>(
  "./excode-dark/theme.json",
  { eager: true }
);

export const builtinThemes: ExcodeTheme[] = Object.values(themeModules).map(
  (m) => m.default
);

function resolveDefaultTheme(): ExcodeTheme {
  const dark = builtinThemes.find((t) => t.name === "ExCode Dark") ?? builtinThemes[0];
  if (dark) localStorage.setItem("excode-theme", dark.name);
  if (!dark) throw new Error("ExCode Dark theme is missing");
  return dark;
}

interface ThemeContextValue {
  theme: ExcodeTheme;
  themes: ExcodeTheme[];
  setTheme: (theme: ExcodeTheme) => void;
  loadThemeFromJson: (json: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ExcodeTheme>(() => {
    const t = resolveDefaultTheme();
    applyTheme(t); // apply synchronously so CSS vars are set before any child effect reads them
    return t;
  });

  function setTheme(t: ExcodeTheme) {
    const darkTheme: ExcodeTheme = { ...t, type: "dark" };
    setThemeState(darkTheme);
    applyTheme(darkTheme);
    localStorage.setItem("excode-theme", darkTheme.name);
  }

  function loadThemeFromJson(json: string) {
    try {
      const parsed = JSON.parse(json) as ExcodeTheme;
      if (!parsed.name || !parsed.colors) throw new Error("Invalid theme file");
      setTheme({ ...parsed, type: "dark" });
    } catch (e) {
      console.error("Failed to load theme:", e);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, themes: builtinThemes, setTheme, loadThemeFromJson }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
