/**
 * French-language pluralization + classification for the activity toast.
 * Pure functions, no Node or Electron dependencies — usable from both
 * the renderer (formatting) and the main process (classification).
 */

export type ActivityType = 'video' | 'image' | 'audio' | 'project';

interface NounForm {
  singular: string;
  plural: string;
  feminine: boolean;
}

const NOUN_FORMS: Record<ActivityType, NounForm> = {
  // `vidéo` and `image` are feminine → the participle agrees in -e / -es.
  // `fichier audio` / `fichier projet` are masculine; "audio" and "projet"
  // are invariable qualifiers, so only `fichier` takes the s in plural.
  video: { singular: 'vidéo', plural: 'vidéos', feminine: true },
  image: { singular: 'image', plural: 'images', feminine: true },
  audio: { singular: 'fichier audio', plural: 'fichiers audio', feminine: false },
  project: { singular: 'fichier projet', plural: 'fichiers projet', feminine: false },
};

function pluralizeParticiple(count: number, feminine: boolean): string {
  const plural = count > 1;
  if (feminine) return plural ? 'envoyées' : 'envoyée';
  return plural ? 'envoyés' : 'envoyé';
}

/**
 * "2 vidéos envoyées vers 03_Outputs"
 * "1 fichier audio envoyé vers 04_OST"
 */
export function formatActivityLine(
  count: number,
  type: ActivityType,
  stageFolderName: string,
): string {
  const form = NOUN_FORMS[type];
  const noun = count > 1 ? form.plural : form.singular;
  const participle = pluralizeParticiple(count, form.feminine);
  return `${count} ${noun} ${participle} vers ${stageFolderName}`;
}

interface ExtensionLists {
  audioExtensions: string[];
  videoExtensions: string[];
  imageExtensions: string[];
  projectExtensions: string[];
}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  if (idx === -1) return '';
  return filename.slice(idx).toLowerCase();
}

/**
 * Buckets a filename into one of the four activity types based on the
 * user's extension lists. `project` is checked first so a `.psd` file
 * isn't misclassified if the user also added `.psd` to another list.
 */
export function classifyExtension(
  filename: string,
  config: ExtensionLists,
): ActivityType | null {
  const ext = getExtension(filename);
  if (!ext) return null;
  if (config.projectExtensions.includes(ext)) return 'project';
  if (config.audioExtensions.includes(ext)) return 'audio';
  if (config.videoExtensions.includes(ext)) return 'video';
  if (config.imageExtensions.includes(ext)) return 'image';
  return null;
}
