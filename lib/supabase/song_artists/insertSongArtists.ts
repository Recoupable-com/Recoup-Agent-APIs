import { TablesInsert } from "../../../types/database.types";
import supabase from "../serverClient";

export type SongArtistInsert = TablesInsert<"song_artists">;

/**
 * Inserts song-artist relationships, skipping duplicates.
 */
export async function insertSongArtists(
  songArtists: SongArtistInsert[]
): Promise<void> {
  const records = songArtists.filter(
    (record): record is SongArtistInsert =>
      Boolean(record.song) && Boolean(record.artist)
  );

  if (records.length === 0) {
    return;
  }

  const deduped = [
    ...new Map(
      records.map((record) => [`${record.song}-${record.artist}`, record])
    ).values(),
  ];

  const { error } = await supabase
    .from("song_artists")
    .upsert(deduped, {
      onConflict: "song,artist",
    });

  if (error) {
    throw new Error(`Failed to insert song artists: ${error.message}`);
  }
}
