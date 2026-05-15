import React, { useState, useEffect, useCallback } from 'react';
import type { AppConfig, RescanPreview } from '../../shared/types';
import { SlotList } from './components/SlotList';
import { StageBar } from './components/StageBar';
import { FooterBar } from './components/FooterBar';
import { NewProjectModal } from './modals/NewProjectModal';
import { EditSlotsModal } from './modals/EditSlotsModal';
import { OpenFoldersModal } from './modals/OpenFoldersModal';
import { RescanModal } from './modals/RescanModal';

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
          height: 468,
          background: '#0A0A0A',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#444', fontSize: 12 }}>…</span>
      </div>
    );
  }

  const divider = <div style={{ height: 1, background: '#191919', margin: '0 0' }} />;

  return (
    <div
      style={{
        width: 290,
        background: '#0A0A0A',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
        position: 'relative',
      }}
    >
      {/* Header — drag region */}
      <div
        className="drag-region flex items-center justify-between px-3"
        style={{ height: 44 }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#FFFFFF',
            userSelect: 'none',
          }}
        >
          SHIFT-K
        </span>

        {config.activeClient ? (
          <span
            style={{
              fontSize: 11,
              color: '#666666',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {config.activeClient}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: '#444444' }}>no client</span>
        )}
      </div>

      {divider}

      {/* Slot list */}
      <SlotList
        slots={config.slots}
        activeClient={config.activeClient}
        onSelect={handleSelectClient}
      />

      {divider}

      {/* Stage bar */}
      <StageBar
        stages={config.stages}
        activeStage={config.activeStage}
        routingEnabled={config.routingEnabled}
        onCycle={handleCycleStage}
      />

      {divider}

      {/* Footer */}
      <FooterBar
        routingEnabled={config.routingEnabled}
        onTogglePause={handleTogglePause}
        onRescan={() => void handleRescan()}
        onOpenFolders={() => setModal('open-folders')}
        onNewProject={() => setModal('new-project')}
        onEditSlots={() => setModal('edit-slots')}
        onSettings={() => void window.shiftK.openSettings()}
      />

      {/* Modals */}
      {modal === 'new-project' && <NewProjectModal onClose={closeModal} />}
      {modal === 'edit-slots' && <EditSlotsModal config={config} onClose={closeModal} />}
      {modal === 'open-folders' && <OpenFoldersModal config={config} onClose={closeModal} />}
      {modal === 'rescan' && rescanPreview && (
        <RescanModal preview={rescanPreview} onClose={closeModal} />
      )}
    </div>
  );
}
