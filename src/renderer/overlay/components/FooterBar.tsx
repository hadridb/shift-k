import React from 'react';
import {
  FolderOpen,
  Pause,
  Play,
  RefreshCw,
  Plus,
  Settings,
  Sliders,
} from 'lucide-react';

interface Props {
  routingEnabled: boolean;
  onTogglePause: () => void;
  onRescan: () => void;
  onOpenFolders: () => void;
  onNewProject: () => void;
  onEditSlots: () => void;
  onSettings: () => void;
}

function IconButton({
  onClick,
  title,
  children,
  disabled = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="no-drag flex items-center justify-center rounded transition-colors duration-100 focus:outline-none"
      style={{
        background: 'transparent',
        color: '#666666',
        cursor: disabled ? 'default' : 'pointer',
        width: 32,
        height: 32,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = '#161616';
          (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = '#666666';
      }}
    >
      {children}
    </button>
  );
}

export function FooterBar({
  routingEnabled,
  onTogglePause,
  onRescan,
  onOpenFolders,
  onNewProject,
  onEditSlots,
  onSettings,
}: Props) {
  return (
    <div className="no-drag flex items-center justify-between px-2 h-11">
      <IconButton onClick={onOpenFolders} title="Ouvrir dossiers">
        <FolderOpen size={14} />
      </IconButton>

      <IconButton onClick={onNewProject} title="Nouveau projet">
        <Plus size={14} />
      </IconButton>

      <IconButton onClick={onEditSlots} title="Slots">
        <Sliders size={14} />
      </IconButton>

      <IconButton
        onClick={onTogglePause}
        title={`${routingEnabled ? 'Pause routing' : 'Reprendre routing'} (Ctrl+Alt+P)`}
      >
        {routingEnabled ? <Pause size={14} /> : <Play size={14} />}
      </IconButton>

      <IconButton onClick={onRescan} title="Rescan Downloads">
        <RefreshCw size={14} />
      </IconButton>

      <IconButton onClick={onSettings} title="Réglages">
        <Settings size={14} />
      </IconButton>
    </div>
  );
}
