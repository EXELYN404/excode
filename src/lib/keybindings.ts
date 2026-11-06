import { invoke } from "@tauri-apps/api/core";

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserKeybinding {
  key: string;
  command: string;
  when?: string;
}

export interface CommandDef {
  id: string;
  label: string;
  category: string;
  defaultKey: string;
  defaultKeyMac?: string;
}

// ── Default command registry ─────────────────────────────────────────────────

export const COMMANDS: CommandDef[] = [
  // File
  { id: "excode.newFile",        label: "New File",             category: "File",    defaultKey: "ctrl+n" },
  { id: "excode.openFile",       label: "Open File",            category: "File",    defaultKey: "ctrl+o" },
  { id: "excode.save",           label: "Save",                 category: "File",    defaultKey: "ctrl+s" },
  { id: "excode.saveAs",         label: "Save As",              category: "File",    defaultKey: "ctrl+shift+s" },
  { id: "excode.closeTab",       label: "Close Editor",         category: "File",    defaultKey: "ctrl+w" },
  // Edit
  { id: "excode.editorUndo",     label: "Undo",                 category: "Edit",    defaultKey: "ctrl+z" },
  { id: "excode.editorRedo",     label: "Redo",                 category: "Edit",    defaultKey: "ctrl+y" },
  { id: "excode.editorFind",     label: "Find",                 category: "Edit",    defaultKey: "ctrl+f" },
  { id: "excode.editorReplace",  label: "Replace",              category: "Edit",    defaultKey: "ctrl+h" },
  { id: "excode.editorCut",      label: "Cut",                  category: "Edit",    defaultKey: "ctrl+x" },
  { id: "excode.editorCopy",     label: "Copy",                 category: "Edit",    defaultKey: "ctrl+c" },
  { id: "excode.editorPaste",    label: "Paste",                category: "Edit",    defaultKey: "ctrl+v" },
  { id: "excode.editorSelectAll",label: "Select All",           category: "Edit",    defaultKey: "ctrl+a" },
  // View
  { id: "excode.togglePalette",  label: "Command Palette",      category: "View",    defaultKey: "ctrl+p" },
  { id: "excode.toggleSidebar",  label: "Toggle Sidebar",       category: "View",    defaultKey: "ctrl+b" },
  { id: "excode.toggleTerminal", label: "Toggle Terminal",      category: "View",    defaultKey: "ctrl+`" },
  { id: "excode.toggleSettings", label: "Open Settings",        category: "View",    defaultKey: "ctrl+," },
  { id: "excode.toggleFullscreen",label: "Toggle Full Screen",  category: "View",    defaultKey: "f11" },
  { id: "excode.zoomIn",         label: "Zoom In",              category: "View",    defaultKey: "ctrl+=" },
  { id: "excode.zoomOut",        label: "Zoom Out",             category: "View",    defaultKey: "ctrl+-" },
  { id: "excode.zoomReset",      label: "Reset Zoom",           category: "View",    defaultKey: "ctrl+0" },
  // Debug
  { id: "excode.startDebug",     label: "Start Debugging",      category: "Debug",   defaultKey: "f5" },
  { id: "excode.stopDebug",      label: "Stop Debugging",       category: "Debug",   defaultKey: "shift+f5" },
  { id: "excode.stepOver",       label: "Step Over",            category: "Debug",   defaultKey: "f10" },
  { id: "excode.stepInto",       label: "Step Into",            category: "Debug",   defaultKey: "f11" },
  { id: "excode.stepOut",        label: "Step Out",             category: "Debug",   defaultKey: "shift+f11" },
  { id: "excode.toggleBreakpoint",label: "Toggle Breakpoint",  category: "Debug",   defaultKey: "f9" },
];

// ── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "excode-keybindings";

export function loadKeybindings(): UserKeybinding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserKeybinding[]).map(b => ({ ...b, command: b.command.startsWith("origin.") ? "excode." + b.command.slice(7) : b.command })) : [];
  } catch {
    return [];
  }
}

export function saveKeybindings(bindings: UserKeybinding[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
}

export function resetKeybindings(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Returns effective key for a command: user override → default. */
export function getEffectiveKey(commandId: string): string | null {
  const user = loadKeybindings();
  const override = user.find(b => b.command === commandId);
  if (override) return override.key;
  return COMMANDS.find(c => c.id === commandId)?.defaultKey ?? null;
}

/** Full map of commandId → effective key (used by the global listener). */
export function getCommandKeyMap(): Record<string, string> {
  const user = loadKeybindings();
  const map: Record<string, string> = {};
  for (const cmd of COMMANDS) {
    map[cmd.id] = cmd.defaultKey;
  }
  for (const b of user) {
    if (b.command) map[b.command] = b.key;
  }
  return map;
}

/** Rebind a single command. Pass null key to remove the override. */
export function setKeybinding(commandId: string, key: string | null): void {
  const bindings = loadKeybindings().filter(b => b.command !== commandId);
  if (key !== null) bindings.push({ command: commandId, key });
  saveKeybindings(bindings);
}

// ── Key matching ─────────────────────────────────────────────────────────────

interface ParsedKey {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
}

function parseKey(keyStr: string): ParsedKey {
  const parts = keyStr.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  return {
    ctrl:  parts.includes("ctrl") || parts.includes("cmd"),
    shift: parts.includes("shift"),
    alt:   parts.includes("alt"),
    key,
  };
}

export function matchesEvent(e: KeyboardEvent, keyStr: string): boolean {
  const { ctrl, shift, alt, key } = parseKey(keyStr);
  // Normalise e.key → lowercase single token
  const eKey = e.key === "`" ? "`"
    : e.key === "=" ? "="
    : e.key === "-" ? "-"
    : e.key === "0" ? "0"
    : e.key === "," ? ","
    : e.key.toLowerCase();

  return (
    (e.ctrlKey || e.metaKey) === ctrl &&
    e.shiftKey === shift &&
    e.altKey === alt &&
    eKey === key
  );
}

// ── VS Code / Cursor / Windsurf import ───────────────────────────────────────

// Maps VS Code command IDs → EXCODE command IDs
const VSCODE_CMD_MAP: Record<string, string> = {
  "workbench.action.files.newUntitledFile":    "excode.newFile",
  "workbench.action.files.openFile":           "excode.openFile",
  "workbench.action.files.save":               "excode.save",
  "workbench.action.files.saveAs":             "excode.saveAs",
  "workbench.action.closeActiveEditor":        "excode.closeTab",
  "undo":                                       "excode.editorUndo",
  "redo":                                       "excode.editorRedo",
  "actions.find":                               "excode.editorFind",
  "editor.action.startFindReplaceAction":      "excode.editorReplace",
  "editor.action.clipboardCutAction":          "excode.editorCut",
  "editor.action.clipboardCopyAction":         "excode.editorCopy",
  "editor.action.clipboardPasteAction":        "excode.editorPaste",
  "editor.action.selectAll":                   "excode.editorSelectAll",
  "workbench.action.quickOpen":                "excode.togglePalette",
  "workbench.action.showCommands":             "excode.togglePalette",
  "workbench.action.toggleSidebarVisibility":  "excode.toggleSidebar",
  "workbench.action.terminal.toggleTerminal":  "excode.toggleTerminal",
  "workbench.action.openSettings":             "excode.toggleSettings",
  "workbench.action.toggleFullScreen":         "excode.toggleFullscreen",
  "workbench.action.zoomIn":                   "excode.zoomIn",
  "workbench.action.zoomOut":                  "excode.zoomOut",
  "workbench.action.zoomReset":                "excode.zoomReset",
  "workbench.action.debug.start":              "excode.startDebug",
  "workbench.action.debug.run":                "excode.startDebug",
  "workbench.action.debug.stop":               "excode.stopDebug",
  "workbench.action.debug.stepOver":           "excode.stepOver",
  "workbench.action.debug.stepInto":           "excode.stepInto",
  "workbench.action.debug.stepOut":            "excode.stepOut",
  "editor.debug.action.toggleBreakpoint":      "excode.toggleBreakpoint",
};

interface ImportResult {
  imported: number;
  bindings: UserKeybinding[];
}

function stripJsonComments(raw: string): string {
  // Very simple single-line comment stripper for keybindings.json
  return raw.replace(/\/\/[^\n]*/g, "");
}

export function parseEditorKeybindings(json: string): ImportResult {
  try {
    const items = JSON.parse(stripJsonComments(json));
    if (!Array.isArray(items)) return { imported: 0, bindings: [] };
    const bindings: UserKeybinding[] = [];
    for (const item of items) {
      if (typeof item.key !== "string" || typeof item.command !== "string") continue;
      // Skip negation entries (command starting with -)
      if (item.command.startsWith("-")) continue;
      const originCmd = VSCODE_CMD_MAP[item.command];
      if (originCmd) {
        bindings.push({
          key: item.key.toLowerCase(),
          command: originCmd,
          ...(item.when ? { when: item.when } : {}),
        });
      }
    }
    return { imported: bindings.length, bindings };
  } catch {
    return { imported: 0, bindings: [] };
  }
}

// ── Tauri wrappers ───────────────────────────────────────────────────────────

export async function detectInstalledEditors(): Promise<string[]> {
  return invoke<string[]>("detect_installed_editors");
}

export async function importKeybindingsFromEditor(editorId: string): Promise<ImportResult> {
  const json = await invoke<string>("read_editor_keybindings", { editor: editorId });
  return parseEditorKeybindings(json);
}

/**
 * Import keybindings from an editor, merge with existing user overrides,
 * and persist. Returns the number of commands that were mapped.
 */
export async function applyKeybindingsFromEditor(editorId: string): Promise<number> {
  const { imported, bindings } = await importKeybindingsFromEditor(editorId);
  if (imported === 0) return 0;
  // Merge: editor import wins over current user overrides for matching commands
  const existing = loadKeybindings().filter(
    b => !bindings.some(nb => nb.command === b.command)
  );
  saveKeybindings([...existing, ...bindings]);
  return imported;
}
