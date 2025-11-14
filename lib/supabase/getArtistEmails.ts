import supabase from "./serverClient";
import { selectAccountArtistIds } from "./account_artist_ids/selectAccountArtistIds";

interface ArtistEmailsResponse {
  emails: string[];
  error: Error | null;
}

/**
 * Gets all email addresses associated with an artist through their accounts
 * @param artistId The ID of the artist
 * @returns Array of email addresses and any error that occurred
 */
const getArtistEmails = async (
  artistId: string
): Promise<ArtistEmailsResponse> => {
  try {
    const accountArtists = await selectAccountArtistIds({
      artist_id: artistId,
    });

    if (!accountArtists || accountArtists.length === 0) {
      return {
        emails: [],
        error: new Error("No accounts found for artist"),
      };
    }

    const accountIds = accountArtists
      .map((aa) => aa.account_id)
      .filter((accountId): accountId is string => Boolean(accountId));

    const { data: accountEmails, error: emailsError } = await supabase
      .from("account_emails")
      .select("email")
      .in("account_id", accountIds);
    if (emailsError) {
      console.error("[ERROR] Failed to get account emails:", emailsError);
      return {
        emails: [],
        error: new Error("Failed to get account emails"),
      };
    }
    if (!accountEmails?.length) {
      return {
        emails: [],
        error: new Error("No emails found for accounts"),
      };
    }

    const emails = accountEmails.map((ae) => ae.email);

    return {
      emails,
      error: null,
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getArtistEmails:", error);
    return {
      emails: [],
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default getArtistEmails;
