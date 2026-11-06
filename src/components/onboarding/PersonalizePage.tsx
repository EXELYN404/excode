import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { KEYMAPS, IMPORTS, type KeymapOption, type ImportOption } from './data';
import { applyKeybindingsFromEditor } from '../../lib/keybindings';

interface Props { onBack: () => void; onComplete: () => void; onSkip: () => void; }

function navBtn(secondary?: boolean): React.CSSProperties {
  return {
    background: secondary ? 'transparent' : 'var(--excode-tooltip-bg)',
    border: secondary ? '1px solid var(--excode-border-default)' : 'none',
    borderRadius: '7px',
    color: secondary ? 'var(--excode-fg-muted)' : 'var(--excode-tooltip-fg)',
    fontSize: '13px', fontWeight: 600, padding: '8px 22px', cursor: 'pointer',
    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px',
    boxShadow: secondary ? 'none' : '0 1px 4px rgba(0,0,0,0.25)', transition: 'opacity 0.15s',
  };
}

function SelectCard({ label, selected, onClick, children }: { label: string; selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 0', minWidth: 0,
        background: selected ? 'var(--excode-bg-base)' : 'var(--excode-bg-editor)',
        border: selected ? 'none' : '1px solid var(--excode-border-default)',
        outline: selected ? '2px solid var(--excode-fg-default)' : 'none',
        borderRadius: '10px', padding: '10px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s', fontFamily: 'inherit',
        color: selected ? 'var(--excode-fg-default)' : 'var(--excode-fg-muted)',
        fontSize: '13px', fontWeight: selected ? 600 : 400,
      }}
      onMouseEnter={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--excode-fg-muted)';
          (e.currentTarget as HTMLElement).style.background = 'var(--excode-bg-base)';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--excode-border-default)';
          (e.currentTarget as HTMLElement).style.background = 'var(--excode-bg-editor)';
        }
      }}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function KeymapPreview({ k }: { k: KeymapOption }) {
  return (
    <div style={{ width: '100%', height: '72px', borderRadius: '6px', background: 'var(--excode-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={k.icon} alt={k.label} style={{ width: '38px', height: '38px', objectFit: 'contain', filter: k.invert ? 'brightness(0) invert(1)' : 'none' }} />
    </div>
  );
}

function ImportPreview({ imp }: { imp: ImportOption }) {
  return (
    <div style={{ width: '100%', height: '72px', borderRadius: '6px', background: imp.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <img src={imp.icon} alt={imp.label} style={imp.wordmark ? { width: '82%', height: 'auto', maxHeight: '28px', objectFit: 'contain' } : { width: imp.size, height: imp.size, objectFit: 'contain', filter: imp.invert ? 'brightness(0) invert(1)' : 'none' }} />
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: '11px', color: 'var(--excode-fg-muted)', textTransform: 'uppercase',
  letterSpacing: '0.9px', fontWeight: 600, marginBottom: '8px',
};

export default function PersonalizePage({ onBack, onComplete, onSkip }: Props) {
  const [selectedKeymap, setSelectedKeymap] = useState<string>('vscode');
  const [selectedImport, setSelectedImport] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  // Persist the keymap preference so Settings can read it later
  function persistKeymap(id: string) {
    localStorage.setItem('excode-keymap', id);
  }

  async function handleEnterExCode() {
    persistKeymap(selectedKeymap);

    if (selectedImport) {
      setImporting(true);
      try {
        await applyKeybindingsFromEditor(selectedImport);
      } catch {
        // Import failure is non-fatal — proceed to IDE anyway
      } finally {
        setImporting(false);
      }
    }

    onComplete();
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 16px' }}>
        <div style={{ width: '100%', maxWidth: '660px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--excode-fg-default)' }}>Personalize</div>
            <div style={{ fontSize: '13px', color: 'var(--excode-fg-muted)', lineHeight: 1.5 }}>Set your keymap and import your existing settings.</div>
          </div>

          {/* Keymap */}
          <div>
            <div style={sectionLabel}>Keymap</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {KEYMAPS.map(k => (
                <SelectCard key={k.id} label={k.label} selected={selectedKeymap === k.id} onClick={() => setSelectedKeymap(k.id)}>
                  <KeymapPreview k={k} />
                </SelectCard>
              ))}
            </div>
          </div>

          {/* Import */}
          <div>
            <div style={sectionLabel}>Import keybindings from</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {IMPORTS.map(imp => (
                <SelectCard key={imp.id} label={imp.label} selected={selectedImport === imp.id} onClick={() => setSelectedImport(selectedImport === imp.id ? null : imp.id)}>
                  <ImportPreview imp={imp} />
                </SelectCard>
              ))}
            </div>
            {selectedImport && (
              <p style={{ fontSize: '12px', color: 'var(--excode-fg-subtle)', margin: '8px 0 0', lineHeight: 1.5 }}>
                Your keybindings.json from {IMPORTS.find(i => i.id === selectedImport)?.label} will be imported. You can always adjust them later in Settings → Keyboard Shortcuts.
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={onSkip}
              style={{ background: 'none', border: 'none', color: 'var(--excode-fg-muted)', fontSize: '12px', cursor: 'pointer', padding: '4px 10px', fontFamily: 'inherit' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--excode-fg-default)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--excode-fg-muted)'; }}
            >
              Skip for now
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onBack}
                disabled={importing}
                style={navBtn(true)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--excode-fg-default)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--excode-fg-muted)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--excode-fg-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--excode-border-default)'; }}
              >
                <ArrowLeft size={16} />Back
              </button>
              <button
                onClick={handleEnterExCode}
                disabled={importing}
                style={{ ...navBtn(), opacity: importing ? 0.7 : 1 }}
                onMouseEnter={e => { if (!importing) (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = importing ? '0.7' : '1'; }}
              >
                {importing ? (
                  <><Loader2 size={15} className="animate-spin" />Importing…</>
                ) : (
                  <>Enter ExCode<ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
