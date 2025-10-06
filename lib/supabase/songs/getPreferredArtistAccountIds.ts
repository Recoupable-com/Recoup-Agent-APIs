import supabase from "../serverClient";
import { Tables } from "../../../types/database.types";
import { toDateValue } from "../../utils/toDateValue";
import { insertAccount } from "../accounts/insertAccount";

/**
 * For each artist name, finds the associated account/artist ID preferring the
 * most recently updated mapping in account_artist_ids.
 *
 * Returns a map keyed by normalized (lowercase) artist name.
 */
export async function getPreferredArtistAccountIds(
  artistNames: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  const uniqueNames = Array.from(
    new Set(
      artistNames
        .map((name) => name.trim())
        .filter((name): name is string => name.length > 0)
    )
  );

  for (const name of uniqueNames) {
    const normalized = name.toLowerCase();

    try {
      const { data, error } = await supabase
        .from("accounts")
        .select(
          `
          id,
          name,
          account_artist_ids:account_artist_ids!account_artist_ids_account_id_fkey (
            artist_id,
            updated_at
          )
        `
        )
        .ilike("name", name);

      if (error) {
        console.error(
          "[ERROR] Failed to fetch accounts for artist name:",
          name,
          error
        );
        continue;
      }

      if (!data || data.length === 0) {
        // No existing account found, create a new one
        try {
          const newAccount = await insertAccount({ name: name });
          result.set(normalized, newAccount.id);
        } catch (insertError) {
          console.error(
            "[ERROR] Failed to create new account for artist name:",
            name,
            insertError
          );
        }
        continue;
      }

      const candidates = (
        data as Array<
          Tables<"accounts"> & {
            account_artist_ids?: Array<Tables<"account_artist_ids"> | null> | null;
          }
        >
      ).map((account) => {
        const links = Array.isArray(account.account_artist_ids)
          ? account.account_artist_ids
              .filter(
                (link): link is Tables<"account_artist_ids"> => link !== null
              )
              .sort(
                (a, b) => toDateValue(b.updated_at) - toDateValue(a.updated_at)
              )
          : [];

        const preferredLink = links[0];

        return {
          accountName: account.name?.trim().toLowerCase() ?? "",
          artistId:
            preferredLink?.artist_id ??
            (typeof account.id === "string" && account.id.length > 0
              ? account.id
              : null),
          updatedAt: preferredLink?.updated_at ?? null,
        };
      });

      const filteredCandidates = candidates.filter(
        (candidate) => candidate.artistId
      );

      if (filteredCandidates.length === 0) {
        continue;
      }

      const exactMatches = filteredCandidates.filter(
        (candidate) => candidate.accountName === normalized
      );

      const pool = exactMatches.length > 0 ? exactMatches : filteredCandidates;

      const best = pool.sort(
        (a, b) => toDateValue(b.updatedAt) - toDateValue(a.updatedAt)
      )[0];

      if (best?.artistId) {
        result.set(normalized, best.artistId);
      }
    } catch (error) {
      console.error(
        "[ERROR] Unexpected error resolving artist account ID:",
        name,
        error
      );
    }
  }

  return result;
}
