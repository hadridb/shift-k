import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApplyTheme } from '@renderer/hooks/useApplyTheme';
import { Screen1Welcome } from './screens/Screen1Welcome';
import { Screen2Downloads } from './screens/Screen2Downloads';
import { Screen3Projects } from './screens/Screen3Projects';
import { Screen4FirstProject } from './screens/Screen4FirstProject';
import { Screen5Shortcuts } from './screens/Screen5Shortcuts';
import { Screen6Extension } from './screens/Screen6Extension';
import { Screen7Ready } from './screens/Screen7Ready';

// Enter transition keeps the cinematic 350 ms slide-up. Exit is forced
// short (120 ms, opacity only) so the previous screen doesn't linger:
// total perceived dwell between a click and the next screen's content
// being readable is ~120 ms, well inside the "feels instant" budget.
const ENTER_TRANSITION = { duration: 0.35, ease: [0.4, 0, 0.2, 1] } as const;
const EXIT_TRANSITION = { duration: 0.12, ease: 'easeIn' } as const;

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Cinematic onboarding — 7-screen state machine with slide-up + fade
 * transitions between steps. The flow saves per-screen so a partial
 * onboarding (user quits midway) doesn't lose what was already
 * confirmed; the final `firstLaunchCompleted: true` flag only flips
 * when the user clicks "Lancer Shift-K" on screen 7.
 */
export function OnboardingApp() {
  // Onboarding is always Obsidian — the cinematic black canvas is a
  // brand decision, not a user pref. Theme picker comes later in
  // Settings.
  useApplyTheme('obsidian');

  const [step, setStep] = useState<Step>(1);
  const [downloadsPath, setDownloadsPath] = useState('');
  const [root, setRoot] = useState('');

  // Seed the path inputs with sensible cross-platform defaults the very
  // first time. The user can override per-screen via the picker. When
  // the config has no downloadsPath yet (first launch), we fall back to
  // the OS Downloads folder so screen 2 isn't blank.
  useEffect(() => {
    void (async () => {
      const config = await window.shiftK.getConfig();
      setRoot(config.root || '');
      if (config.downloadsPath) {
        setDownloadsPath(config.downloadsPath);
      } else {
        const osDefault = await window.shiftK.getDefaultDownloads();
        setDownloadsPath(osDefault);
      }
    })();
  }, []);

  function go(next: Step) {
    setStep(next);
  }

  async function persistPartial(updates: { root?: string; downloadsPath?: string }) {
    await window.shiftK.updateConfig(updates);
  }

  async function handleDownloadsConfirm(path: string) {
    setDownloadsPath(path);
    await persistPartial({ downloadsPath: path });
    go(3);
  }

  async function handleProjectsConfirm(newRoot: string) {
    setRoot(newRoot);
    await persistPartial({ root: newRoot });
    go(4);
  }

  async function handleCreateFirstProject(client: string, mission: string) {
    try {
      await window.shiftK.createProject(client, mission);
    } catch {
      // Swallow — the screen logs in its own error path if needed; we
      // proceed regardless so a quirky filesystem name doesn't trap
      // the user.
    }
    go(5);
  }

  async function handleLaunch() {
    await window.shiftK.completeOnboarding();
    // Main process closes the window and opens the overlay; nothing
    // else to do here.
  }

  // `mode="wait"` keeps screens from overlapping during a transition —
  // when iter 2 removed it to fix a perceived gap before the screen-7
  // particle burst, the cross-fade made screen 6 visually linger over
  // screen 7 instead. We bring back wait-mode but cut the exit duration
  // to 120 ms so the previous screen clears fast.
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: ENTER_TRANSITION }}
        exit={{ opacity: 0, transition: EXIT_TRANSITION }}
        style={{ position: 'fixed', inset: 0 }}
      >
        {step === 1 && <Screen1Welcome onNext={() => go(2)} />}
        {step === 2 && (
          <Screen2Downloads
            initialPath={downloadsPath}
            onNext={(p) => void handleDownloadsConfirm(p)}
            onBack={() => go(1)}
          />
        )}
        {step === 3 && (
          <Screen3Projects
            initialPath={root}
            onNext={(p) => void handleProjectsConfirm(p)}
            onBack={() => go(2)}
          />
        )}
        {step === 4 && (
          <Screen4FirstProject
            onCreate={handleCreateFirstProject}
            onSkip={() => go(5)}
            onBack={() => go(3)}
          />
        )}
        {step === 5 && (
          <Screen5Shortcuts onNext={() => go(6)} onBack={() => go(4)} />
        )}
        {step === 6 && (
          <Screen6Extension onNext={() => go(7)} onBack={() => go(5)} />
        )}
        {step === 7 && (
          <Screen7Ready onLaunch={() => void handleLaunch()} onBack={() => go(6)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
