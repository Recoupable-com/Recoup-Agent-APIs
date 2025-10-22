import { SongWithSpotify } from "./getSongsByIsrc";
import { songsIsrcQueue, SongsIsrcJobData } from "../redis/songsQueue";

/**
 * Queues songs ISRCs to Redis for background processing
 * @param songs - Array of songs with Spotify data
 * @returns Promise that resolves when all jobs are queued
 */
export async function queueRedisSongs(songs: SongWithSpotify[]): Promise<void> {
  if (songs.length === 0) return;

  // Queue each ISRC to Redis for background processing
  const queuePromises = songs.map(async (song) => {
    if (!song.isrc) return;

    const jobData: SongsIsrcJobData = {
      isrc: song.isrc,
      songData: {
        name: song.name || undefined,
        artists:
          song.spotifyArtists?.map((artist) => artist.name).join(", ") ||
          undefined,
        album: song.album || undefined,
        duration_ms: undefined, // Not available in SongWithSpotify
        popularity: undefined, // Not available in SongWithSpotify
        release_date: undefined, // Not available in SongWithSpotify
        explicit: undefined, // Not available in SongWithSpotify
      },
    };

    try {
      await songsIsrcQueue.add(`process-isrc-${song.isrc}`, jobData, {
        jobId: `isrc-${song.isrc}`, // Unique job ID to prevent duplicates
        priority: 1, // Higher priority for ISRC processing
      });
      console.log(`[Queue] Queued ISRC job: ${song.isrc}`);
    } catch (error) {
      console.error(
        `[Queue] Failed to queue ISRC job for ${song.isrc}:`,
        error
      );
    }
  });

  // Wait for all jobs to be queued
  await Promise.allSettled(queuePromises);
}
