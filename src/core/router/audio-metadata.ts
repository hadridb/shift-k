/**
 * Audio metadata extraction — interface stub (Sprint 8c, ADR-036).
 *
 * Will read ID3 (mp3), Vorbis comments (flac, ogg, opus), MP4 atoms (m4a),
 * and AIFF chunks to extract source identifiers that the filename alone
 * cannot reveal. Target Sprint 16 : brancher `music-metadata` (~140 kB,
 * pure JS, pas de native dep, cross-platform).
 *
 * **Pourquoi ce stub maintenant ?** Le bug Sprint 8c (Suno qui exporte
 * `Track Title.mp3` sans aucun marqueur dans le nom) sera definitivement
 * resolu via les tags ID3 — Suno embed son nom dans le tag `TENC`
 * (Encoded By) et son ID de track dans `TXXX:SUNO_TRACK_ID`. Pareil pour
 * ElevenLabs (`TENC: ElevenLabs`), Udio (`TXXX:UDIO_*`), AIVA (`TPE2`).
 *
 * D'ici la, le fallback `routeAllAudio` capture les orphelins audio vers
 * le stage configure ; ce stub n'est PAS appele par le resolver. Il existe
 * uniquement pour fixer le contrat d'interface et eviter qu'on reinvente
 * la signature au Sprint 16.
 *
 * @example
 * // Aujourd'hui (Sprint 8c) :
 * extractAudioMetadata('/Downloads/My_Song.mp3')
 * // → {}
 *
 * @example
 * // Cible (Sprint 16, avec music-metadata branche) :
 * await extractAudioMetadata('/Downloads/My_Song.mp3')
 * // → { source: 'suno', title: 'My Song', software: 'Suno v4', sunoTrackId: '...' }
 *
 * Note signature : la version Sprint 16 sera async (lecture I/O des
 * premiers ~4-8 kB du fichier). L'API actuelle est sync car le stub
 * retourne {} ; la migration sync → async demandera un refactor des
 * callers (resolveDestination notamment). Documente ici pour ne pas
 * oublier le piege.
 */

import type { Stage } from '@shared/types';

export interface AudioMetadata {
  /**
   * Identifiant canonique de la plateforme source (cle des `platforms`
   * du config), si detectable. Permet au resolver de mapper vers
   * PLATFORM_STAGE_OVERRIDES sans dependre du filename.
   */
  source?: string;

  /** Titre du morceau, depuis le tag TIT2 (mp3) / TITLE (vorbis). */
  title?: string;

  /** Nom de l'artiste, depuis TPE1 / ARTIST. */
  artist?: string;

  /** Nom du logiciel ou de la plateforme encodeuse, depuis TENC / ENCODER. */
  software?: string;

  /**
   * Stage suggere par les metadonnees elles-memes (ex: un tag custom
   * `TXXX:SHIFTK_STAGE: ost` permettrait a une session de pre-tagger ses
   * exports). Optional, faible priorite vs PLATFORM_STAGE_OVERRIDES.
   */
  suggestedStage?: Stage;

  /**
   * Duree en secondes. Pas utilise par le routing aujourd'hui, mais utile
   * pour la future recherche Phase Gamma (filtrer "morceaux > 30 s").
   */
  durationSeconds?: number;
}

/**
 * Sprint 8c stub. Retourne toujours un objet vide.
 *
 * Le resolver ne l'appelle PAS encore — l'introduire dans le hot path
 * du watcher demanderait :
 *   1. Migration sync → async de resolveDestination (qui est sync
 *      depuis Sprint 1 et appelee dans une closure chokidar `on('add')`)
 *   2. Decision sur le cout I/O au chargement (lire les 4-8 premiers kB
 *      de chaque fichier audio detecte) — acceptable pour Suno (~3 MB)
 *      mais a chiffrer pour des banks Splice (.wav 200 MB).
 *   3. Cache LRU des metadonnees deja extraites par chemin
 *      (les rescans rejouent les memes fichiers).
 *
 * Au Sprint 16, remplacer le corps par :
 * ```ts
 * import { parseFile } from 'music-metadata';
 * const meta = await parseFile(filePath, { duration: false, skipCovers: true });
 * return mapToShiftKMetadata(meta.common, meta.native);
 * ```
 *
 * @param _filePath chemin absolu vers le fichier audio. Param prefixe
 *   d'underscore pour signaler "non utilise" sans casser l'API publique.
 */
export function extractAudioMetadata(_filePath: string): AudioMetadata {
  return {};
}
