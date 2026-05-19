import React, { useState } from 'react';
import { useApplyTheme } from '@renderer/hooks/useApplyTheme';

type Step = 1 | 2 | 3;

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 6,
  color: 'var(--text-primary)',
  fontSize: 13,
  padding: '8px 10px',
  outline: 'none',
  width: '100%',
};

const hintStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--text-muted)',
  marginTop: 5,
  lineHeight: 1.5,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'var(--text-secondary)',
  marginBottom: 6,
};

function Stepper({ step }: { step: Step }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[1, 2, 3].map((n) => {
        const isActive = n === step;
        const isDone = n < step;
        return (
          <div
            key={n}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isActive
                ? 'var(--accent)'
                : isDone
                  ? 'var(--text-muted)'
                  : 'var(--border-subtle)',
            }}
          />
        );
      })}
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'var(--bg-elevated)' : 'var(--accent)',
        border: 'none',
        borderRadius: 6,
        color: disabled ? 'var(--text-disabled)' : 'var(--bg-primary)',
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        padding: '10px 22px',
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--text-secondary)',
        fontSize: 12,
        cursor: 'pointer',
        padding: '10px 14px',
      }}
    >
      {children}
    </button>
  );
}

function PathPicker({
  label,
  hint,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  async function pick() {
    const result = await window.shiftK.pickFolder(label);
    if (result) onChange(result);
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoFocus={autoFocus}
        />
        <button
          onClick={() => void pick()}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            fontSize: 11,
            cursor: 'pointer',
            padding: '0 14px',
            whiteSpace: 'nowrap',
          }}
        >
          Choisir…
        </button>
      </div>
      <div style={hintStyle}>{hint}</div>
    </div>
  );
}

export function OnboardingApp() {
  // Onboarding always uses the default theme — config isn't reachable yet.
  useApplyTheme('obsidian');

  const [step, setStep] = useState<Step>(1);
  const [root, setRoot] = useState('');
  const [downloadsPath, setDownloadsPath] = useState('');
  const [busy, setBusy] = useState(false);

  async function goToStep3() {
    if (!root.trim() || !downloadsPath.trim()) return;
    setBusy(true);
    try {
      await window.shiftK.updateConfig({
        root: root.trim(),
        downloadsPath: downloadsPath.trim(),
      });
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    try {
      await window.shiftK.completeOnboarding();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 32px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: 'var(--text-primary)',
          }}
        >
          SHIFT-K
        </span>
        <Stepper step={step} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '32px 32px 8px', overflow: 'auto' }}>
        {step === 1 && (
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 500,
                margin: '0 0 14px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Bienvenue.
            </h1>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: '0 0 14px',
                maxWidth: 420,
              }}
            >
              Shift-K route automatiquement vos téléchargements (Runway, Kling, Luma,
              Higgsfield, Sora, Midjourney…) dans la bonne arborescence client / stage /
              jour.
            </p>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: 0,
                maxWidth: 420,
              }}
            >
              Deux dossiers à configurer pour démarrer.
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: '0 0 22px',
                color: 'var(--text-primary)',
                letterSpacing: '0.02em',
              }}
            >
              Où vivent vos projets ?
            </h2>

            <PathPicker
              label="Dossier racine des projets"
              hint="Un sous-dossier sera créé par projet client. Idéalement déjà rangé."
              value={root}
              onChange={setRoot}
              autoFocus
            />

            <PathPicker
              label="Dossier Downloads à surveiller"
              hint="Le dossier de téléchargement de votre navigateur."
              value={downloadsPath}
              onChange={setDownloadsPath}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                margin: '0 0 8px',
                color: 'var(--text-primary)',
              }}
            >
              Tout est prêt.
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 22px' }}>
              L'overlay s'ouvrira juste après. Créez un projet via le bouton{' '}
              <code style={{ color: 'var(--text-primary)' }}>+</code>, assignez-le à un
              slot, puis utilisez les raccourcis :
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Ctrl+Alt+1..9', 'Basculer entre clients'],
                ['Ctrl+Alt+S', 'Cycler le stage actif'],
                ['Ctrl+Alt+P', 'Pause / reprise du routage'],
              ].map(([keys, desc]) => (
                <div
                  key={keys}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 12,
                  }}
                >
                  <code
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      padding: '3px 8px',
                      color: 'var(--text-primary)',
                      fontSize: 11,
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      minWidth: 110,
                      textAlign: 'center',
                    }}
                  >
                    {keys}
                  </code>
                  <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '14px 32px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {step === 2 && <SecondaryButton onClick={() => setStep(1)}>Retour</SecondaryButton>}
        </div>
        <div>
          {step === 1 && (
            <PrimaryButton onClick={() => setStep(2)}>Commencer</PrimaryButton>
          )}
          {step === 2 && (
            <PrimaryButton
              onClick={() => void goToStep3()}
              disabled={busy || !root.trim() || !downloadsPath.trim()}
            >
              {busy ? '…' : 'Suivant'}
            </PrimaryButton>
          )}
          {step === 3 && (
            <PrimaryButton onClick={() => void finish()} disabled={busy}>
              {busy ? '…' : 'Terminer'}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
