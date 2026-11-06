import type { ExcodeTheme } from "./types";

// "bg.editor" → "--excode-bg-editor"
function tokenToCssVar(token: string): string {
  return "--excode-" + token.replace(/\./g, "-");
}

export function applyTheme(theme: ExcodeTheme): void {
  const root = document.documentElement;
  for (const [token, value] of Object.entries(theme.colors)) {
    root.style.setProperty(tokenToCssVar(token), value);
  }
  root.setAttribute("data-theme", theme.type);
}
