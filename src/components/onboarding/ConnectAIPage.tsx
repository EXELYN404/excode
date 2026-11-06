import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight, ArrowLeft, Eye, EyeOff, ChevronDown, Check,
  Search, KeyRound, Cpu, ExternalLink
} from 'lucide-react';
import { PROVIDERS, CDN, type Provider } from './data';

interface Props {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

const input: React.CSSProperties = {
  background: '#101010',
  border: '1px solid #292929',
  borderRadius: '8px',
  color: 'var(--excode-fg-default)',
  fontSize: '13px',
  padding: '11px 13px',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
};

const fieldLabel: React.CSSProperties = {
  fontSize: '10px',
  color: '#777',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontWeight: 700,
};

function navBtn(secondary?: boolean): React.CSSProperties {
  return {
    background: secondary ? 'transparent' : '#eeeeee',
    border: secondary ? '1px solid #303030' : '1px solid #eeeeee',
    borderRadius: '8px',
    color: secondary ? '#b5b5b5' : '#111',
    fontSize: '12px',
    fontWeight: 650,
    padding: '10px 17px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.15s',
  };
}

interface SelectProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  extraOption?: string;
}

function ModelSelect({ options, value, onChange, extraOption }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

  const allOptions = extraOption ? [...options, extraOption] : options;

  useEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    setDropPos({ top: r.bottom + 4, left: r.left, width: r.width });

    function onDown(e: MouseEvent) {
      if (!triggerRef.current?.contains(e.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          ...input,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          borderColor: open ? '#777' : '#292929',
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {value || allOptions[0]}
        </span>
        <ChevronDown
          size={14}
          style={{
            flexShrink: 0,
            marginLeft: 8,
            color: '#777',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {open && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            background: '#171717',
            border: '1px solid #333',
            borderRadius: '9px',
            boxShadow: '0 12px 35px rgba(0,0,0,.55)',
            zIndex: 9999,
            padding: 5,
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {allOptions.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              onMouseEnter={() => setHovered(opt)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: hovered === opt ? '#292929' : 'transparent',
                color: value === opt ? '#fff' : '#aaa',
                fontSize: 12,
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {opt}
              </span>
              {value === opt && <Check size={13} />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

function ProviderCard({
  p,
  selected,
  onClick,
}: {
  p: Provider;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '11px 12px',
        width: '100%',
        minWidth: 0,
        background: selected ? '#202020' : '#111111',
        border: `1px solid ${selected ? '#eeeeee' : '#292929'}`,
        borderRadius: 9,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color .15s, background .15s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#555';
          e.currentTarget.style.background = '#191919';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#292929';
          e.currentTarget.style.background = '#111111';
        }
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090909',
        border: '1px solid #292929',
        borderRadius: 8,
      }}>
        {p.icon
          ? <img
              src={CDN + p.icon}
              alt={p.label}
              style={{
                width: 25,
                height: 25,
                objectFit: 'contain',
                filter: p.invert ? 'brightness(0) invert(1)' : 'none',
              }}
            />
          : <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#aaa',
            }}>
              {p.label.slice(0, 2)}
            </span>
        }
      </div>

      <span style={{
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        fontWeight: selected ? 650 : 500,
        color: selected ? '#fff' : '#aaa',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {p.label}
      </span>

      {selected && (
        <Check size={14} color="#fff" style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}


export default function ConnectAIPage({ onBack, onNext, onSkip }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Provider | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = search
    ? PROVIDERS.filter(p =>
        p.label.toLowerCase().includes(search.toLowerCase())
      )
    : PROVIDERS;

  useEffect(() => {
    // Default model saat provider berubah, sama seperti perilaku sebelumnya.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selected) setSelectedModel(selected.models[0] ?? '');
  }, [selected]);

  return (
    <div className="excode-provider-page">
      <main className="excode-provider-main">

        <header className="excode-provider-heading">
          <div>
            <div className="excode-provider-eyebrow">
              <span className="excode-provider-eyebrow-dot" />
              INITIAL SETUP / AI CONFIGURATION
            </div>
            <h1>Connect your AI provider</h1>
            <p>
              Choose your preferred provider and configure the connection.
              You can change these settings later.
            </p>
          </div>
          <div className="excode-provider-step">02 <span>/ 03</span></div>
        </header>

        <section className="excode-provider-layout">

          {/* LEFT: Provider selection */}
          <aside className="excode-provider-sidebar">
            <div className="excode-panel-heading">
              <div>
                <span className="excode-panel-index">01</span>
                <span className="excode-panel-title">AI PROVIDERS</span>
              </div>
              <span className="excode-provider-count">
                {filtered.length} AVAILABLE
              </span>
            </div>

            <div className="excode-provider-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search providers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search providers"
              />
              <kbd>/</kbd>
            </div>

            <div
              ref={scrollRef}
              className="excode-provider-list"
            >
              {filtered.length === 0 ? (
                <div className="excode-provider-empty-search">
                  No provider found.
                </div>
              ) : (
                filtered.map(p => (
                  <ProviderCard
                    key={p.id}
                    p={p}
                    selected={selected?.id === p.id}
                    onClick={() => {
                      setSelected(p);
                      setShowKey(false);
                    }}
                  />
                ))
              )}
            </div>

            <div className="excode-provider-sidebar-foot">
              <span className="excode-status-dot" />
              Select one provider to continue
            </div>
          </aside>

          {/* RIGHT: Selected provider configuration */}
          <section className="excode-provider-config">
            <div className="excode-panel-heading">
              <div>
                <span className="excode-panel-index">02</span>
                <span className="excode-panel-title">CONFIGURATION</span>
              </div>
              <span className="excode-config-state">
                {selected ? 'PROVIDER SELECTED' : 'AWAITING SELECTION'}
              </span>
            </div>

            {!selected ? (
              <div className="excode-config-empty">
                <div className="excode-config-empty-icon">
                  <Cpu size={25} strokeWidth={1.4} />
                </div>
                <h2>Select a provider</h2>
                <p>
                  Choose an AI provider from the panel on the left.
                  Its configuration options will appear here.
                </p>
                <div className="excode-config-empty-line" />
                <span>12 INTEGRATION OPTIONS</span>
              </div>
            ) : (
              <div className="excode-config-content">
                <div className="excode-selected-provider">
                  <div className="excode-selected-provider-logo">
                    {selected.icon
                      ? <img
                          src={CDN + selected.icon}
                          alt={selected.label}
                          style={{
                            width: 34,
                            height: 34,
                            objectFit: 'contain',
                            filter: selected.invert
                              ? 'brightness(0) invert(1)'
                              : 'none',
                          }}
                        />
                      : <span>{selected.label.slice(0, 2)}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="excode-selected-label">SELECTED PROVIDER</span>
                    <h2>{selected.label}</h2>
                  </div>
                  <span className="excode-selected-check">
                    <Check size={14} />
                  </span>
                </div>

                <div className="excode-config-divider" />

                <div className="excode-config-field">
                  <div className="excode-config-label-row">
                    <label style={fieldLabel}>{selected.keyLabel}</label>
                    <span className="excode-field-optional">CONNECTION</span>
                  </div>

                  <div className="excode-key-input-wrap">
                    <KeyRound size={15} />
                    <input
                      type={showKey || selected.group === 'local' ? 'text' : 'password'}
                      placeholder={selected.keyPlaceholder}
                      style={{
                        ...input,
                        border: 'none',
                        background: 'transparent',
                        padding: '11px 4px',
                        paddingRight: 8,
                      }}
                    />
                    {selected.group !== 'local' && (
                      <button
                        type="button"
                        onClick={() => setShowKey(v => !v)}
                        aria-label={showKey ? 'Hide API key' : 'Show API key'}
                        className="excode-key-toggle"
                      >
                        {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>

                  {selected.docs && (
                    <a
                      href={selected.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="excode-provider-docs"
                    >
                      Get API key
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="excode-config-field">
                  <div className="excode-config-label-row">
                    <label style={fieldLabel}>MODEL</label>
                    <span className="excode-field-optional">MODEL SELECTION</span>
                  </div>

                  {selected.models.length > 0
                    ? (
                      <ModelSelect
                        options={selected.models}
                        value={selectedModel}
                        onChange={setSelectedModel}
                        extraOption={
                          selected.customModels
                            ? 'Custom model…'
                            : undefined
                        }
                      />
                    )
                    : (
                      <input
                        type="text"
                        placeholder={
                          selected.group === 'local'
                            ? 'llama3.2, mistral, gemma3…'
                            : 'Model name'
                        }
                        style={input}
                      />
                    )
                  }
                </div>

                <div className="excode-config-note">
                  <span className="excode-status-dot" />
                  <span>
                    Your provider configuration can be adjusted later.
                  </span>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>

      {/* Existing onboarding navigation */}
      <footer className="excode-provider-footer">
        <button
          type="button"
          onClick={onSkip}
          className="excode-provider-skip"
        >
          Skip for now
        </button>

        <div className="excode-provider-footer-actions">
          <button
            type="button"
            onClick={onBack}
            style={navBtn(true)}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#777';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#303030';
              e.currentTarget.style.color = '#b5b5b5';
            }}
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            style={navBtn()}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#eeeeee';
            }}
          >
            Next
            <ArrowRight size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
}
