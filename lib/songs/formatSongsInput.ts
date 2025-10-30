import { TablesInsert } from "../../types/database.types";

export type SongInput = TablesInsert<"songs"> & { artists?: string[] };

export type FormattedSongsInput = {
  songsForUpsert: TablesInsert<"songs">[];
  artistsByIsrc: Record<string, string[]>;
};

export function formatSongsInput(songs: SongInput[]): FormattedSongsInput {
  const artistsByIsrc: Record<string, string[]> = {};

  songs.forEach((song) => {
    if (song.isrc && Array.isArray(song.artists) && song.artists.length > 0) {
      artistsByIsrc[song.isrc] = song.artists;
    }
  });

  const songsForUpsert: TablesInsert<"songs">[] = songs.map(
    ({ isrc, name, album, notes }) => ({
      isrc,
      name,
      album,
      notes,
    })
  );

  return { songsForUpsert, artistsByIsrc };
}
