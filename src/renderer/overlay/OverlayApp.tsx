import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { AppConfig, RescanPreview, Stage } from '../../shared/types';
import { SlotList } from './components/SlotList';
import { StageBar } from './components/StageBar';
import { FooterBar } from './components/FooterBar';
import { ActivityToast } from './components/ActivityToast';
import { AuroraBackground } from './components/AuroraBackground';
import { NewProjectModal } from './modals/NewProjectModal';
import { EditSlotsModal } from './modals/EditSlotsModal';
import { OpenFoldersModal } from './modals/OpenFoldersModal';
import { RescanModal } from './modals/RescanModal';
import { useApplyTheme } from '@renderer/hooks/useApplyTheme';
import { THEMES, DEFAULT_THEME_ID } from '@renderer/styles/themes';

type ModalType = 'new-project' | 'edit-slots' | 'open-folders' | 'rescan' | null;

function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    void window.shiftK.getConfig().then(setConfig);
    return window.shiftK.onConfigChange(setConfig);
  }, []);

  return config;
}

function useJklShortcuts(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Skip when typing in any form control (modal inputs).
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Plain Shift + J/K/L — no other modifiers.
      if (!e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.code === 'KeyJ') {
        e.preventDefault();
        void window.shiftK.previousSlot();
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        void window.shiftK.toggleRouting();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        void window.shiftK.nextSlot();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}

export function OverlayApp() {
  const config = useConfig();
  const [modal, setModal] = useState<ModalType>(null);
  const [rescanPreview, setRescanPreview] = useState<RescanPreview | null>(null);

  // Drive `<html data-theme>` from the persisted preference AND track the
  // live-preview theme via the IPC broadcast. The returned `activeThemeId`
  // is what conditional component mounts (Aurora gradient, .glass-layer)
  // should key off — config.preferences.theme alone would miss the
  // live-preview state from the Settings picker. See ADR-029.
  const activeThemeId = useApplyTheme(
    config?.preferences.theme ?? DEFAULT_THEME_ID,
  );

  // Suspend J/K/L while a modal is open so users can type freely.
  useJklShortcuts(modal === null);

  const closeModal = useCallback(() => {
    setModal(null);
    setRescanPreview(null);
  }, []);

  const confirmBefore = config?.preferences.confirmBeforeRescan ?? true;

  const handleSelectClient = useCallback((client: string | null) => {
    void window.shiftK.setActiveClient(client);
  }, []);

  const handleCycleStage = useCallback(() => {
    void window.shiftK.cycleStage();
  }, []);

  const handleSelectStage = useCallback((stage: Stage) => {
    void window.shiftK.setActiveStage(stage);
  }, []);

  const handleTogglePause = useCallback(() => {
    void window.shiftK.toggleRouting();
  }, []);

  const handleRescan = useCallback(async () => {
    if (confirmBefore) {
      const preview = await window.shiftK.previewRescan();
      setRescanPreview(preview);
      setModal('rescan');
    } else {
      await window.shiftK.triggerRescan();
    }
  }, [confirmBefore]);

  if (!config) {
    return (
      <div
        style={{
          width: 290,
          height: 460,
          background: 'var(--bg-primary)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'var(--text-disabled)', fontSize: 12 }}>…</span>
      </div>
    );
  }

  const divider = (
    <div style={{ height: 1, background: 'var(--border-divider)', margin: '0 0' }} />
  );

  const currentTheme = THEMES[activeThemeId] ?? THEMES[DEFAULT_THEME_ID];

  return (
    // Container fills the entire BrowserWindow (290×460) so the rounded
    // corners + overflow:hidden + position:relative form the bounding box
    // for every absolutely-positioned child (modals, toast). Modals must
    // NEVER use position:fixed — see ADR-028.
    <div
      className="overlay-root"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-primary)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-overlay)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Aurora animated gradient — mounted only when the active theme
          asks for it. Renders at z-index 0 behind the rest. */}
      {currentTheme.animatedBackground && (
        <AuroraBackground
          colors={currentTheme.animatedBackground.colors}
          durationSeconds={currentTheme.animatedBackground.durationSeconds}
        />
      )}

      {/* Liquid Glass dedicated frosted layer — only mounted for this
          theme. Sits at z-index 0 behind the content (z-index ≥ 1).
          The backdrop-filter lives on this layer rather than the root
          container so the layout stays simple. */}
      {currentTheme.id === 'liquid-glass' && <div className="glass-layer" />}

      {/* Header — drag region */}
      <div
        className="drag-region flex items-center justify-between px-3"
        style={{ height: 44, flexShrink: 0, position: 'relative', zIndex: 1 }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--text-primary)',
            userSelect: 'none',
          }}
        >
          SHIFT-K
        </span>

        {config.activeClient ? (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {config.activeClient}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-disabled)' }}>no client</span>
        )}
      </div>

      {divider}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <SlotList
          slots={config.slots}
          activeClient={config.activeClient}
          onSelect={handleSelectClient}
        />
      </div>

      {divider}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <StageBar
          stages={config.stages}
          activeStage={config.activeStage}
          routingEnabled={config.routingEnabled}
          onCycle={handleCycleStage}
          onSelect={handleSelectStage}
        />
      </div>

      {divider}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <FooterBar
          routingEnabled={config.routingEnabled}
          onTogglePause={handleTogglePause}
          onRescan={() => void handleRescan()}
          onOpenFolders={() => setModal('open-folders')}
          onNewProject={() => setModal('new-project')}
          onEditSlots={() => setModal('edit-slots')}
          onSettings={() => void window.shiftK.openSettings()}
        />
      </div>

      <ActivityToast />

      {/* Modals — wrapped in AnimatePresence so the fade+scale exit plays */}
      <AnimatePresence>
        {modal === 'new-project' && <NewProjectModal key="new-project" onClose={closeModal} />}
        {modal === 'edit-slots' && (
          <EditSlotsModal key="edit-slots" config={config} onClose={closeModal} />
        )}
        {modal === 'open-folders' && (
          <OpenFoldersModal key="open-folders" config={config} onClose={closeModal} />
        )}
        {modal === 'rescan' && rescanPreview && (
          <RescanModal key="rescan" preview={rescanPreview} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}
