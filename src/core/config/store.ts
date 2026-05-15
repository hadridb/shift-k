import ElectronStore from 'electron-store';
import { AppConfigSchema, defaultConfig } from './schema';
import type { AppConfig } from '@shared/types';

const store = new ElectronStore<AppConfig>({
  name: 'config',
  defaults: defaultConfig,
});

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
