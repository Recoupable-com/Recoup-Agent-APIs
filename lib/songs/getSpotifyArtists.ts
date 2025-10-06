export type SpotifyArtist = {
  id: string | null;
  name: string | null;
};

export function getSpotifyArtists(
  artists: unknown
): SpotifyArtist[] | undefined {
  if (!Array.isArray(artists)) {
    return undefined;
  }

  const mapped = artists.map((artist: any) => ({
    id: artist.id,
    name: artist.name,
  }));

  return mapped.length > 0 ? mapped : undefined;
}
