import React from 'react';
import { FolderOpen, Pause, Play, RefreshCw, Plus, Settings } from 'lucide-react';

interface Props {
  routingEnabled: boolean;
  onTogglePause: () => void;
  onRescan: () => void;
  onOpenFolders: () => void;
  onNewProject: () => void;
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
      className="no-drag flex items-center justify-center w-9 h-9 rounded transition-colors duration-100 focus:outline-none"
      style={{ background: 'transparent', color: '#666666', cursor: disabled ? 'default' : 'pointer' }}
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
  onSettings,
}: Props) {
  return (
    <div className="no-drag flex items-center justify-between px-2 h-11">
      <IconButton onClick={onOpenFolders} title="Open folders (Ctrl+Alt+F)">
        <FolderOpen size={15} />
      </IconButton>

      <IconButton onClick={onTogglePause} title={routingEnabled ? 'Pause routing' : 'Resume routing'}>
        {routingEnabled ? <Pause size={15} /> : <Play size={15} />}
      </IconButton>

      <IconButton onClick={onRescan} title="Rescan Downloads now">
        <RefreshCw size={15} />
      </IconButton>

      <IconButton onClick={onNewProject} title="New project">
        <Plus size={15} />
      </IconButton>

      <IconButton onClick={onSettings} title="Settings">
        <Settings size={15} />
      </IconButton>
    </div>
  );
}
