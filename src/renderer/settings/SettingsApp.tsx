import React, { useState, useEffect } from 'react';
import type { AppConfig, StageLabels, Stage } from '@shared/types';

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
  root: string;
  downloadsPath: string;
  stages: StageLabels;
  dailyFoldersEnabled: boolean;
  dailyFolderFormat: string;
  lazyDailyFolders: boolean;
  groupByPlatform: boolean;
  routeAllAudio: boolean;
  audioExtensions: string[];
  audioPlatforms: Record<string, string[]>;
  notifyOnRoute: boolean;
  confirmBeforeRescan: boolean;
  startOnLogin: boolean;
  logRetentionDays: number;
}

function formFromConfig(config: AppConfig): Form {
  const audioPlatforms: Record<string, string[]> = {};
  for (const key of AUDIO_PLATFORM_KEYS) {
    audioPlatforms[key] = [...(config.platforms[key] ?? [])];
  }
  return {
    root: config.root,
    downloadsPath: config.downloadsPath,
    stages: { ...config.stages },
    dailyFoldersEnabled: config.preferences.dailyFoldersEnabled,
    dailyFolderFormat: config.preferences.dailyFolderFormat,
    lazyDailyFolders: config.preferences.lazyDailyFolders,
    groupByPlatform: config.preferences.groupByPlatform,
    routeAllAudio: config.preferences.routeAllAudio,
    audioExtensions: [...config.audioExtensions],
    audioPlatforms,
    notifyOnRoute: config.preferences.notifyOnRoute,
    confirmBeforeRescan: config.preferences.confirmBeforeRescan,
    startOnLogin: config.preferences.startOnLogin,
    logRetentionDays: config.preferences.logRetentionDays,
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
  background: '#141414',
  border: '1px solid #232323',
  borderRadius: 6,
  color: '#ffffff',
  fontSize: 13,
  padding: '8px 10px',
  outline: 'none',
  width: '100%',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.18em',
  color: '#666666',
  marginBottom: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#9a9a9a',
  marginBottom: 6,
};

const hintStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#555555',
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
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 6,
          color: '#cccccc',
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
          <span style={{ color: '#444', fontSize: 11, fontStyle: 'italic' }}>
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
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 4,
              padding: '3px 6px 3px 8px',
              fontSize: 11,
              color: '#cfcfcf',
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
                color: '#666',
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
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: 6,
            color: input.trim() ? '#cccccc' : '#444',
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
          border: `1px solid ${checked ? '#ffffff' : '#3a3a3a'}`,
          background: checked ? '#ffffff' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div>
        <div style={{ fontSize: 12, color: checked ? '#ffffff' : '#aaaaaa' }}>{label}</div>
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

export function SettingsApp() {
  const [form, setForm] = useState<Form | null>(null);
  const [original, setOriginal] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    void window.shiftK.getConfig().then((config) => {
      setForm(formFromConfig(config));
      setOriginal(config);
    });
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
        platforms: mergedPlatforms,
        preferences: {
          ...original.preferences,
          dailyFoldersEnabled: form.dailyFoldersEnabled,
          dailyFolderFormat: form.dailyFolderFormat,
          lazyDailyFolders: form.lazyDailyFolders,
          routeAllAudio: form.routeAllAudio,
          groupByPlatform: form.groupByPlatform,
          notifyOnRoute: form.notifyOnRoute,
          confirmBeforeRescan: form.confirmBeforeRescan,
          startOnLogin: form.startOnLogin,
          logRetentionDays: form.logRetentionDays,
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
        <span style={{ color: '#444', fontSize: 12 }}>…</span>
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
          borderBottom: '1px solid #161616',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#ffffff',
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
                    background: '#0c0c0c',
                    border: '1px solid #1c1c1c',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#888',
                  }}
                >
                  <div style={{ fontSize: 9, letterSpacing: '0.15em', color: '#555', marginBottom: 4 }}>
                    EXEMPLE POUR AUJOURD'HUI
                  </div>
                  <code style={{ fontSize: 11, color: '#cfcfcf' }}>
                    {activeStageName}/{sampleFolder}/Gen-4_demo.mp4
                  </code>
                </div>
              </>
            );
          })()}
        </Section>

        <Section title="AUDIO">
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
                      color: '#cfcfcf',
                      marginBottom: 6,
                      fontWeight: 500,
                    }}
                  >
                    {AUDIO_PLATFORM_LABELS[key]}{' '}
                    <span style={{ color: '#555', fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>
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
                  background: '#0c0c0c',
                  border: '1px solid #1c1c1c',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#888',
                }}
              >
                <div style={{ fontSize: 9, letterSpacing: '0.15em', color: '#555', marginBottom: 4 }}>
                  EXEMPLE
                </div>
                <code style={{ fontSize: 11, color: '#cfcfcf' }}>
                  ElevenLabs_voice.mp3 → {sampleClient}/{ostStageName}{dailyFolder}/
                </code>
              </div>
            );
          })()}
        </Section>

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
          borderTop: '1px solid #161616',
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
            color: '#888888',
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
            background: dirty && !saving ? '#ffffff' : '#2a2a2a',
            border: 'none',
            borderRadius: 6,
            color: dirty && !saving ? '#000000' : '#555555',
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
