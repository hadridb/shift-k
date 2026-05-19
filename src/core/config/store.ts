import ElectronStore from 'electron-store';
import { AppConfigSchema, defaultConfig } from './schema';
import { POST_V1_PLATFORM_PATTERNS, mergeNewPlatformPatterns } from './migrations';
import type { AppConfig } from '@shared/types';

const store = new ElectronStore<AppConfig>({
  name: 'config',
  defaults: defaultConfig,
});

function migrate(): void {
  const raw = store.store as Partial<AppConfig>;

  // 1. Merge audio platforms into pre-v0.2 configs.
  const existing = (raw.platforms ?? {}) as Record<string, string[]>;
  const merged = mergeNewPlatformPatterns(existing, POST_V1_PLATFORM_PATTERNS);
  if (Object.keys(merged).length !== Object.keys(existing).length) {
    store.set('platforms', merged);
  }

  // 2. Sprint 8: gate the new cinematic onboarding to first launch only.
  // Existing users whose config already has root + downloadsPath set should
  // not see the onboarding — flip firstLaunchCompleted to true silently.
  const prefs = (raw.preferences ?? {}) as Partial<AppConfig['preferences']>;
  const hasCompleteConfig = Boolean(raw.root && raw.downloadsPath);
  if (hasCompleteConfig && prefs.firstLaunchCompleted !== true) {
    store.set('preferences', { ...prefs, firstLaunchCompleted: true });
  }
}

migrate();

export function getConfig(): AppConfig {
  return AppConfigSchema.parse(store.store);
}

export function setConfig(updates: Partial<AppConfig>): void {
  for (const [key, value] of Object.entries(updates)) {
    store.set(key, value);
  }
}

export function setConfigKey<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
  store.set(key, value);
}

export function onConfigChange(callback: (config: AppConfig) => void): () => void {
  const unsubscribe = store.onDidAnyChange(() => {
    callback(getConfig());
  });
  return unsubscribe as () => void;
}

export { store as _store };
