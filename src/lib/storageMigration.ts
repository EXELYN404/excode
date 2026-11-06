const STORAGE_KEY_MIGRATIONS: readonly (readonly [string, string])[] = [
  ["origin-onboarding", "excode-onboarding"],
  ["origin-editor-ai-autocomplete", "excode-editor-ai-autocomplete"],
  ["origin-ai-provider", "excode-ai-provider"],
  ["origin-ai-model", "excode-ai-model"],
  ["origin-ai-effort", "excode-ai-effort"],
  ["origin-ai-system-prompt", "excode-ai-system-prompt"],
  ["origin-ai-ask-prompt", "excode-ai-ask-prompt"],
  ["origin-ai-plan-prompt", "excode-ai-plan-prompt"],
  ["origin-ai-panel-width", "excode-ai-panel-width"],
  ["origin-ai-chat-view", "excode-ai-chat-view"],
  ["origin-ai-ctx-width", "excode-ai-ctx-width"],
  ["origin-preview-url", "excode-preview-url"],
  ["origin-web-preview", "excode-web-preview"],
  ["origin-debug-last-config", "excode-debug-last-config"],
  ["origin-workspace-folder", "excode-workspace-folder"],
  ["origin-sidebar-open", "excode-sidebar-open"],
  ["origin-ai-panel-open", "excode-ai-panel-open"],
  ["origin-terminal-open", "excode-terminal-open"],
  ["origin-terminal-height", "excode-terminal-height"],
  ["origin-terminal-tabs", "excode-terminal-tabs"],
  ["origin-terminal-active-index", "excode-terminal-active-index"],
  ["origin-editor-autocomplete-delay", "excode-editor-autocomplete-delay"],
  ["origin-editor-autocomplete-delay-unit", "excode-editor-autocomplete-delay-unit"],
  ["origin-keymap", "excode-keymap"],
  ["origin-keybindings", "excode-keybindings"],
  ["origin_pricing_cache", "excode_pricing_cache"],
  ["origin-sessions-v1", "excode-sessions-v1"],
  ["origin_ai_usage", "excode_ai_usage"],
  ["origin-theme", "excode-theme"],
];

const PREFIX_MIGRATIONS: readonly (readonly [string, string])[] = [
  ["origin-pinboard-notes:", "excode-pinboard-notes:"],
  ["origin-pinboard:", "excode-pinboard:"],
  ["origin-active-session:", "excode-active-session:"],
];

export function migrateExCodeStorage(): void {
  try {
    for (const [oldKey, newKey] of STORAGE_KEY_MIGRATIONS) {
      if (localStorage.getItem(newKey) !== null) continue;
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null) localStorage.setItem(newKey, oldValue);
    }

    const keys = Array.from(
      { length: localStorage.length },
      (_, i) => localStorage.key(i),
    ).filter((key): key is string => key !== null);

    for (const oldKey of keys) {
      const migration = PREFIX_MIGRATIONS.find(([prefix]) =>
        oldKey.startsWith(prefix),
      );
      if (!migration) continue;

      const newKey = migration[1] + oldKey.slice(migration[0].length);
      if (localStorage.getItem(newKey) !== null) continue;

      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null) localStorage.setItem(newKey, oldValue);
    }
  } catch (error) {
    console.warn("ExCode storage migration could not complete:", error);
  }
}
