// Port of Resolve-PhasmaPlatform from Phasma-Core.ps1
// Matches a filename against platform patterns (case-insensitive substring match)

export function resolvePlatform(
  fileName: string,
  platforms: Record<string, string[]>,
): string | null {
  const lower = fileName.toLowerCase();
  for (const [platformKey, patterns] of Object.entries(platforms)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern.toLowerCase())) {
        return platformKey;
      }
    }
  }
  return null;
}
