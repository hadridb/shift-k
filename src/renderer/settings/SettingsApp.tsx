import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppConfig, StageLabels, Stage, ThemeId } from '@shared/types';
import {
  THEMES,
  THEME_ORDER,
  DEFAULT_THEME_ID,
  checkAvailability,
  type Platform,
  type Theme,
} from '@renderer/styles/themes';
import { useApplyTheme } from '@renderer/hooks/useApplyTheme';

const AUDIO_PLATFORM_KEYS = [
  'suno', 'elevenlabs', 'udio', 'stable_audio', 'aiva',
  'mubert', 'soundraw', 'splice', 'loopcloud', 'cymatics',
] as const;

const AUDIO_PLATFORM_LABELS: Record<string, string> = {
  suno: 'Suno',
  elevenlabs: 'ElevenLabs',
  udio: 'Udio',
  stable_audio: 'Stable Audio',
  aiva: 'AIVA',
  mubert: 'Mubert',
  soundraw: 'Soundraw',
  splice: 'Splice',
  loopcloud: 'Loopcloud',
  cymatics: 'Cymatics',
};

interface Form {
  theme: ThemeId;
  root: string;
  downloadsPath: string;
  stages: StageLabels;
  dailyFoldersEnabled: boolean;
  dailyFolderFormat: string;
  lazyDailyFolders: boolean;
  groupByPlatform: boolean;
  routeAllAudio: boolean;
  audioExtensions: string[];
  imageExtensions: string[];
  videoExtensions: string[];
  projectExtensions: string[];
  audioPlatforms: Record<string, string[]>;
  notifyOnRoute: boolean;
  confirmBeforeRescan: boolean;
  startOnLogin: boolean;
  logRetentionDays: number;
  accordion: Record<string, boolean>;
}

function formFromConfig(config: AppConfig): Form {
  const audioPlatforms: Record<string, string[]> = {};
  for (const key of AUDIO_PLATFORM_KEYS) {
    audioPlatforms[key] = [...(config.platforms[key] ?? [])];
  }
  return {
    theme: config.preferences.theme,
    root: config.root,
    downloadsPath: config.downloadsPath,
    stages: { ...config.stages },
    dailyFoldersEnabled: config.preferences.dailyFoldersEnabled,
    dailyFolderFormat: config.preferences.dailyFolderFormat,
    lazyDailyFolders: config.preferences.lazyDailyFolders,
    groupByPlatform: config.preferences.groupByPlatform,
    routeAllAudio: config.preferences.routeAllAudio,
    audioExtensions: [...config.audioExtensions],
    imageExtensions: [...config.imageExtensions],
    videoExtensions: [...config.videoExtensions],
    projectExtensions: [...config.projectExtensions],
    audioPlatforms,
    notifyOnRoute: config.preferences.notifyOnRoute,
    confirmBeforeRescan: config.preferences.confirmBeforeRescan,
    startOnLogin: config.preferences.startOnLogin,
    logRetentionDays: config.preferences.logRetentionDays,
    accordion: { ...config.preferences.settingsAccordionState },
  };
}

function normalizeExtension(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

const FORMAT_PRESETS = [
  { key: 'simple', label: 'Simple — J<date>', format: 'J{yyyy-MM-dd}' },
  { key: 'stage', label: 'Avec stage — <stage> J<date>', format: '{stage} J{yyyy-MM-dd}' },
  { key: 'stage-hyphen', label: 'Avec stage hyphen — <stage>-<date>', format: '{stage}-{yyyy-MM-dd}' },
  { key: 'custom', label: 'Personnalisé', format: '' },
] as const;

type FormatKey = (typeof FORMAT_PRESETS)[number]['key'];

function detectFormatKey(format: string): FormatKey {
  const match = FORMAT_PRESETS.find((p) => p.key !== 'custom' && p.format === format);
  return match ? match.key : 'custom';
}

function previewDailyFolder(format: string, stageName: string, date: Date): string {
  const yyyy = date.getFullYear().toString();
  const MM = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return format.replace('{stage}', stageName).replace('{yyyy-MM-dd}', `${yyyy}-${MM}-${dd}`);
}

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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.18em',
  color: 'var(--text-muted)',
  marginBottom: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'var(--text-secondary)',
  marginBottom: 6,
};

const hintStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--text-disabled)',
  marginTop: 5,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={sectionTitleStyle}>{title}</div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  );
}

function PathInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  async function pick() {
    const picked = await window.shiftK.pickFolder();
    if (picked) onChange(picked);
  }
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input
        style={{ ...inputStyle, flex: 1 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        spellCheck={false}
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
          padding: '0 12px',
          whiteSpace: 'nowrap',
        }}
      >
        Choisir…
      </button>
    </div>
  );
}

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '6px 0 6px 0',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <motion.svg
          width={10}
          height={10}
          viewBox="0 0 10 10"
          fill="none"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          style={{ flexShrink: 0 }}
        >
          <path d="M3 2L7 5L3 8" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" />
        </motion.svg>
        <span style={{ ...sectionTitleStyle, marginBottom: 0 }}>{title}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 8, paddingLeft: 18 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChipList({
  values,
  onAdd,
  onRemove,
  placeholder,
  normalize,
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  normalize?: (raw: string) => string | null;
}) {
  const [input, setInput] = useState('');

  function commit() {
    const raw = input;
    const value = normalize ? normalize(raw) : raw.trim();
    if (!value) return;
    if (values.includes(value)) {
      setInput('');
      return;
    }
    onAdd(value);
    setInput('');
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {values.length === 0 && (
          <span style={{ color: 'var(--text-disabled)', fontSize: 11, fontStyle: 'italic' }}>
            (vide — aucun motif)
          </span>
        )}
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              padding: '3px 6px 3px 8px',
              fontSize: 11,
              color: 'var(--text-primary)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {v}
            <button
              onClick={() => onRemove(i)}
              title="Retirer"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
                lineHeight: 1,
                padding: 0,
                width: 14,
                height: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          style={{ ...inputStyle, flex: 1, fontSize: 12 }}
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
          }}
          spellCheck={false}
        />
        <button
          onClick={commit}
          disabled={!input.trim()}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            color: input.trim() ? 'var(--text-secondary)' : 'var(--text-disabled)',
            fontSize: 11,
            cursor: input.trim() ? 'pointer' : 'default',
            padding: '0 12px',
          }}
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        cursor: 'pointer',
        userSelect: 'none',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          marginTop: 1,
          borderRadius: 3,
          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-subtle)'}`,
          background: checked ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div>
        <div style={{ fontSize: 12, color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</div>
        {hint && <div style={hintStyle}>{hint}</div>}
      </div>
    </div>
  );
}

const STAGE_LABELS_FR: Record<Stage, string> = {
  src: 'Sources (src)',
  img: 'Images (img)',
  out: 'Outputs (out)',
  ost: 'OST (ost)',
  liv: 'Renders (liv)',
};

const STAGE_KEYS: Stage[] = ['src', 'img', 'out', 'ost', 'liv'];

/**
 * Mini-preview rendered inside each theme card. Uses the theme's actual
 * `cssVars` (not the live `var(--*)` values) so the card shows the theme
 * even when it's not currently active. We do this by setting an inline
 * `style` block on the wrapper that overrides every relevant var locally.
 */
function ThemePreview({ theme }: { theme: Theme }) {
  // Build an inline-style override that overrides each --* token used by
  // the preview snippet. CSS resolves `var(--bg-elevated)` against this
  // scope, so the preview reads the theme even when <html data-theme>
  // is different.
  const override = theme.cssVars as React.CSSProperties;
  const isAurora = !!theme.animatedBackground;
  return (
    <div
      style={{
        ...override,
        position: 'relative',
        width: '100%',
        height: 56,
        borderRadius: 6,
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {isAurora && theme.animatedBackground && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${theme.animatedBackground.colors.join(', ')})`,
            backgroundSize: '200% 200%',
            opacity: 0.85,
          }}
        />
      )}
      <div style={{ position: 'relative', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[true, false, false].map((active, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 2,
                height: 8,
                background: active ? 'var(--accent)' : 'transparent',
                borderRadius: 999,
              }}
            />
            <span
              style={{
                flex: 1,
                height: 6,
                background: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: 2,
                opacity: active ? 0.95 : 0.35,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemePickerGrid({
  value,
  platform,
  release,
  onPick,
}: {
  value: ThemeId;
  platform: Platform;
  release: string;
  onPick: (id: ThemeId) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
      }}
    >
      {THEME_ORDER.map((id) => {
        const theme = THEMES[id];
        const avail = checkAvailability(theme, platform, release);
        const isActive = value === id;
        const disabled = !avail.available;
        return (
          <button
            key={id}
            onClick={() => {
              if (!disabled) onPick(id);
            }}
            disabled={disabled}
            title={avail.reason}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: 10,
              background: 'var(--bg-elevated)',
              border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
              borderRadius: 8,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.4 : 1,
              textAlign: 'left',
              transition: 'border-color 150ms ease-out',
            }}
          >
            <ThemePreview theme={theme} />
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 2,
                }}
              >
                {theme.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  lineHeight: 1.3,
                }}
              >
                {theme.description}
              </div>
              {avail.usesFallback && (
                <div
                  style={{
                    fontSize: 9,
                    color: 'var(--text-disabled)',
                    fontStyle: 'italic',
                    marginTop: 4,
                  }}
                >
                  Fallback CSS
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function SettingsApp() {
  const [form, setForm] = useState<Form | null>(null);
  const [original, setOriginal] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [platformInfo, setPlatformInfo] = useState<{ platform: Platform; release: string }>({
    platform: 'windows',
    release: '0.0.0',
  });

  // Live theme preview — every form.theme change immediately flips
  // <html data-theme> and triggers the main process's native effects.
  useApplyTheme(form?.theme ?? DEFAULT_THEME_ID);

  useEffect(() => {
    void window.shiftK.getConfig().then((config) => {
      setForm(formFromConfig(config));
      setOriginal(config);
    });
    void window.shiftK.getPlatformInfo().then(setPlatformInfo);
  }, []);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
  }

  function updateStage(stage: Stage, value: string) {
    setForm((prev) =>
      prev ? { ...prev, stages: { ...prev.stages, [stage]: value } } : prev,
    );
    setDirty(true);
  }

  function mutate(mutator: (f: Form) => Form) {
    setForm((prev) => (prev ? mutator(prev) : prev));
    setDirty(true);
  }

  async function handleSave() {
    if (!form || !original || saving) return;
    setSaving(true);
    try {
      // Merge audio platforms back into the full platforms map, preserving
      // any non-audio entry the user may have customized in the store.
      const mergedPlatforms: Record<string, string[]> = { ...original.platforms };
      for (const key of AUDIO_PLATFORM_KEYS) {
        mergedPlatforms[key] = form.audioPlatforms[key] ?? [];
      }
      await window.shiftK.updateConfig({
        root: form.root,
        downloadsPath: form.downloadsPath,
        stages: form.stages,
        audioExtensions: form.audioExtensions,
        imageExtensions: form.imageExtensions,
        videoExtensions: form.videoExtensions,
        projectExtensions: form.projectExtensions,
        platforms: mergedPlatforms,
        preferences: {
          ...original.preferences,
          theme: form.theme,
          dailyFoldersEnabled: form.dailyFoldersEnabled,
          dailyFolderFormat: form.dailyFolderFormat,
          lazyDailyFolders: form.lazyDailyFolders,
          routeAllAudio: form.routeAllAudio,
          groupByPlatform: form.groupByPlatform,
          notifyOnRoute: form.notifyOnRoute,
          confirmBeforeRescan: form.confirmBeforeRescan,
          startOnLogin: form.startOnLogin,
          logRetentionDays: form.logRetentionDays,
          settingsAccordionState: form.accordion,
        },
      });
      window.close();
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    window.close();
  }

  if (!form || !original) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'var(--text-disabled)', fontSize: 12 }}>…</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid var(--border-divider)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--text-primary)',
          }}
        >
          RÉGLAGES
        </div>
      </div>

      {/* Body — scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
        }}
      >
        <Section title="APPARENCE">
          <ThemePickerGrid
            value={form.theme}
            platform={platformInfo.platform}
            release={platformInfo.release}
            onPick={(t) => mutate((f) => ({ ...f, theme: t }))}
          />
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              marginTop: 14,
              fontStyle: 'italic',
            }}
          >
            Certains thèmes utilisent les effets natifs de votre système d'exploitation
            pour une intégration parfaite.
          </div>
        </Section>

        <Section title="GÉNÉRAL">
          <Field
            label="Dossier racine des projets"
            hint="Tous les clients sont créés ici. Doit contenir un sous-dossier _TEMPLATE pour les nouveaux projets."
          >
            <PathInput
              value={form.root}
              onChange={(v) => update('root', v)}
              placeholder="ex : E:\Projects\AI"
            />
          </Field>

          <Field
            label="Dossier Downloads à surveiller"
            hint="Les fichiers IA téléchargés ici seront routés automatiquement."
          >
            <PathInput
              value={form.downloadsPath}
              onChange={(v) => update('downloadsPath', v)}
              placeholder="ex : C:\Users\Hadrien\Downloads"
            />
          </Field>
        </Section>

        <Section title="DOSSIERS DE STAGE">
          {STAGE_KEYS.map((stage) => (
            <Field key={stage} label={STAGE_LABELS_FR[stage]}>
              <input
                style={inputStyle}
                value={form.stages[stage]}
                onChange={(e) => updateStage(stage, e.target.value)}
                spellCheck={false}
              />
            </Field>
          ))}
        </Section>

        <Section title="DOSSIERS PAR JOUR">
          <ToggleRow
            checked={form.dailyFoldersEnabled}
            onChange={(v) => update('dailyFoldersEnabled', v)}
            label="Créer un sous-dossier par jour"
            hint="Si désactivé, les fichiers sont rangés directement dans le dossier du stage, sans hiérarchie par date."
          />

          {form.dailyFoldersEnabled && (() => {
            const activeStageName = form.stages[original.activeStage];
            const formatKey = detectFormatKey(form.dailyFolderFormat);
            const sampleDate = new Date();
            const sampleFolder = previewDailyFolder(form.dailyFolderFormat, activeStageName, sampleDate);
            return (
              <>
                <Field
                  label="Format du nom"
                  hint="Le placeholder {stage} se remplace par le nom du stage actif, {yyyy-MM-dd} par la date du jour."
                >
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={formatKey}
                    onChange={(e) => {
                      const key = e.target.value as FormatKey;
                      const preset = FORMAT_PRESETS.find((p) => p.key === key);
                      if (!preset) return;
                      if (key === 'custom') {
                        if (detectFormatKey(form.dailyFolderFormat) !== 'custom') {
                          update('dailyFolderFormat', form.dailyFolderFormat || 'J{yyyy-MM-dd}');
                        }
                      } else {
                        update('dailyFolderFormat', preset.format);
                      }
                    }}
                  >
                    {FORMAT_PRESETS.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </Field>

                {formatKey === 'custom' && (
                  <Field label="Format personnalisé">
                    <input
                      style={inputStyle}
                      value={form.dailyFolderFormat}
                      onChange={(e) => update('dailyFolderFormat', e.target.value)}
                      placeholder="ex : {stage}_{yyyy-MM-dd}"
                      spellCheck={false}
                    />
                  </Field>
                )}

                <div
                  style={{
                    marginTop: 6,
                    padding: '10px 12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    EXEMPLE POUR AUJOURD'HUI
                  </div>
                  <code style={{ fontSize: 11, color: 'var(--text-primary)' }}>
                    {activeStageName}/{sampleFolder}/Gen-4_demo.mp4
                  </code>
                </div>
              </>
            );
          })()}
        </Section>

        <AccordionSection
          title="AUDIO"
          open={form.accordion.audio ?? true}
          onToggle={() =>
            mutate((f) => ({
              ...f,
              accordion: { ...f.accordion, audio: !(f.accordion.audio ?? true) },
            }))
          }
        >
          <Field
            label="Extensions reconnues comme audio"
            hint="Les fichiers avec ces extensions sont routés vers le stage OST si la plateforme matche (Suno, ElevenLabs, etc.)."
          >
            <ChipList
              values={form.audioExtensions}
              onAdd={(v) =>
                mutate((f) => ({ ...f, audioExtensions: [...f.audioExtensions, v] }))
              }
              onRemove={(idx) =>
                mutate((f) => ({
                  ...f,
                  audioExtensions: f.audioExtensions.filter((_, i) => i !== idx),
                }))
              }
              placeholder="ex : .mp3, mp3 ou .opus"
              normalize={normalizeExtension}
            />
          </Field>

          <Field
            label="Motifs de détection par plateforme audio"
            hint="Chaque motif est cherché en sous-chaîne case-insensitive dans le nom du fichier. Premier match gagnant."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {AUDIO_PLATFORM_KEYS.map((key) => (
                <div key={key}>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-primary)',
                      marginBottom: 6,
                      fontWeight: 500,
                    }}
                  >
                    {AUDIO_PLATFORM_LABELS[key]}{' '}
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>
                      ({key})
                    </span>
                  </div>
                  <ChipList
                    values={form.audioPlatforms[key] ?? []}
                    onAdd={(v) =>
                      mutate((f) => ({
                        ...f,
                        audioPlatforms: {
                          ...f.audioPlatforms,
                          [key]: [...(f.audioPlatforms[key] ?? []), v],
                        },
                      }))
                    }
                    onRemove={(idx) =>
                      mutate((f) => ({
                        ...f,
                        audioPlatforms: {
                          ...f.audioPlatforms,
                          [key]: (f.audioPlatforms[key] ?? []).filter((_, i) => i !== idx),
                        },
                      }))
                    }
                    placeholder="motif (ex : SUNO_)"
                  />
                </div>
              ))}
            </div>
          </Field>

          <ToggleRow
            checked={form.routeAllAudio}
            onChange={(v) => update('routeAllAudio', v)}
            label="Capturer tous les fichiers audio vers OST"
            hint="Active uniquement si ton Downloads ne contient JAMAIS d'audio personnel (musique perso, podcasts). Sinon laisse off — seules les plateformes reconnues seront routées."
          />

          {(() => {
            const sampleDate = new Date();
            const ostStageName = form.stages['ost'];
            const dailyFolder = form.dailyFoldersEnabled
              ? `/${previewDailyFolder(form.dailyFolderFormat, ostStageName, sampleDate)}`
              : '';
            const sampleClient = original.activeClient ?? '<Client>';
            return (
              <div
                style={{
                  marginTop: 8,
                  padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 4 }}>
                  EXEMPLE
                </div>
                <code style={{ fontSize: 11, color: 'var(--text-primary)' }}>
                  ElevenLabs_voice.mp3 → {sampleClient}/{ostStageName}{dailyFolder}/
                </code>
              </div>
            );
          })()}
        </AccordionSection>

        <AccordionSection
          title="IMAGES"
          open={form.accordion.image ?? false}
          onToggle={() =>
            mutate((f) => ({
              ...f,
              accordion: { ...f.accordion, image: !(f.accordion.image ?? false) },
            }))
          }
        >
          <Field
            label="Extensions reconnues comme image"
            hint="Les images matchant une plateforme visuelle (Runway, Kling, Midjourney, etc.) sont routées vers le stage actif."
          >
            <ChipList
              values={form.imageExtensions}
              onAdd={(v) =>
                mutate((f) => ({ ...f, imageExtensions: [...f.imageExtensions, v] }))
              }
              onRemove={(idx) =>
                mutate((f) => ({
                  ...f,
                  imageExtensions: f.imageExtensions.filter((_, i) => i !== idx),
                }))
              }
              placeholder="ex : .png, png ou .webp"
              normalize={normalizeExtension}
            />
          </Field>
        </AccordionSection>

        <AccordionSection
          title="VIDÉO"
          open={form.accordion.video ?? false}
          onToggle={() =>
            mutate((f) => ({
              ...f,
              accordion: { ...f.accordion, video: !(f.accordion.video ?? false) },
            }))
          }
        >
          <Field
            label="Extensions reconnues comme vidéo"
            hint="Les vidéos matchant une plateforme (Runway, Kling, Luma, Veo, etc.) sont routées vers le stage actif."
          >
            <ChipList
              values={form.videoExtensions}
              onAdd={(v) =>
                mutate((f) => ({ ...f, videoExtensions: [...f.videoExtensions, v] }))
              }
              onRemove={(idx) =>
                mutate((f) => ({
                  ...f,
                  videoExtensions: f.videoExtensions.filter((_, i) => i !== idx),
                }))
              }
              placeholder="ex : .mp4, mp4 ou .mov"
              normalize={normalizeExtension}
            />
          </Field>
        </AccordionSection>

        <AccordionSection
          title="FICHIERS PROJET"
          open={form.accordion.project ?? false}
          onToggle={() =>
            mutate((f) => ({
              ...f,
              accordion: { ...f.accordion, project: !(f.accordion.project ?? false) },
            }))
          }
        >
          <Field
            label="Extensions de fichiers projet"
            hint="Ces fichiers (PSD, AI, PRPROJ, AEP…) sont toujours routés vers le stage Sources (01_SRC Inits), quel que soit le stage actif."
          >
            <ChipList
              values={form.projectExtensions}
              onAdd={(v) =>
                mutate((f) => ({ ...f, projectExtensions: [...f.projectExtensions, v] }))
              }
              onRemove={(idx) =>
                mutate((f) => ({
                  ...f,
                  projectExtensions: f.projectExtensions.filter((_, i) => i !== idx),
                }))
              }
              placeholder="ex : .psd, psd ou .aep"
              normalize={normalizeExtension}
            />
          </Field>
        </AccordionSection>

        <Section title="PRÉFÉRENCES">
          <ToggleRow
            checked={form.lazyDailyFolders}
            onChange={(v) => update('lazyDailyFolders', v)}
            label="Créer les dossiers journaliers à la demande"
            hint="Si désactivé, tous les dossiers du jour sont créés à l'avance."
          />

          <ToggleRow
            checked={form.groupByPlatform}
            onChange={(v) => update('groupByPlatform', v)}
            label="Grouper par plateforme"
            hint="Crée des sous-dossiers Runway/Kling/Luma… dans chaque dossier journalier."
          />

          <ToggleRow
            checked={form.notifyOnRoute}
            onChange={(v) => update('notifyOnRoute', v)}
            label="Notification système à chaque routage"
          />

          <ToggleRow
            checked={form.confirmBeforeRescan}
            onChange={(v) => update('confirmBeforeRescan', v)}
            label="Confirmer avant rescan (dry run)"
            hint="Désactiver une fois confiant : Rescan déplacera directement les fichiers."
          />

          <ToggleRow
            checked={form.startOnLogin}
            onChange={(v) => update('startOnLogin', v)}
            label="Démarrer au login"
            hint="Shift-K se lance silencieusement avec le tray icon. Disponible uniquement sur l'app installée (pas en dev)."
          />

          <Field label="Rétention des logs (jours)">
            <input
              type="number"
              min={1}
              max={365}
              style={{ ...inputStyle, width: 100 }}
              value={form.logRetentionDays}
              onChange={(e) =>
                update('logRetentionDays', Math.max(1, parseInt(e.target.value, 10) || 1))
              }
            />
          </Field>
        </Section>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--border-divider)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <button
          onClick={handleCancel}
          disabled={saving}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 12,
            cursor: 'pointer',
            padding: '8px 14px',
          }}
        >
          Annuler
        </button>
        <button
          onClick={() => void handleSave()}
          disabled={!dirty || saving}
          style={{
            background: dirty && !saving ? 'var(--accent)' : 'var(--bg-elevated)',
            border: 'none',
            borderRadius: 6,
            color: dirty && !saving ? 'var(--bg-primary)' : 'var(--text-disabled)',
            fontSize: 12,
            fontWeight: 600,
            cursor: dirty && !saving ? 'pointer' : 'default',
            padding: '8px 18px',
          }}
        >
          {saving ? '…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
