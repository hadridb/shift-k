# Shift-K

> Workflow OS for AI directors juggling multiple luxury clients.

Shift-K automatically routes your AI-generated downloads (Runway, Higgsfield, Kling, Luma, Sora, Krea, Midjourney…) into the right client project, the right stage, the right day. No more dragging files between Explorer windows, no more broken DaVinci links, no more wrong-client mistakes at 2am.

## Status

**Early development.** Pre-alpha. Internal use only.

Currently being built by [@hadridb](https://github.com/hadridb) with [Claude](https://claude.com/code).

## What it does

- **Watches your Downloads folder** in real time
- **Routes** any file matching an AI platform pattern (Gen-4*, kling*, higgsfield*, Luma*, sora*, etc.) to `<active client>\<active stage>\J<date>\`
- **Multi-client slots** — Ctrl+Alt+1..9 to switch active client in one keystroke
- **Always-on-top overlay** showing active client + stage at all times
- **Pause routing** for personal downloads or weekends
- **Open multiple project folders** in one click via checkboxes
- **(Coming, Phase Gamma)** Browser extension that captures prompt, seed, parameters and tags every download
- **(Coming, Phase Gamma)** Local search across all generated shots by prompt

## Built with

Electron · React · TypeScript · Vite · Tailwind · pnpm · chokidar · electron-builder

## License

Proprietary. All rights reserved.
