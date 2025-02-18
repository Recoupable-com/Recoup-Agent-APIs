import supabase from "./serverClient";

interface ArtistEmailResponse {
  email: string | null;
  error: Error | null;
}

/**
 * Gets the email address associated with an artist's account
 * @param artistAccountId The ID of the artist's account
 * @returns The email address and any error that occurred
 */
const getArtistEmail = async (
  artistAccountId: string
): Promise<ArtistEmailResponse> => {
  try {
    console.log("[DEBUG] Getting email for artist:", artistAccountId);

    const { data, error } = await supabase
      .from("account_emails")
      .select("email")
      .eq("account_id", artistAccountId)
      .single();

    if (error) {
      console.error("[ERROR] Failed to get artist email:", error);
      return {
        email: null,
        error: new Error("Failed to get artist email"),
      };
    }

    if (!data || !data.email) {
      console.log("[DEBUG] No email found for artist:", artistAccountId);
      return {
        email: null,
        error: new Error("No email found for artist"),
      };
    }

    console.log("[DEBUG] Found email for artist");
    return {
      email: data.email,
      error: null,
    };
  } catch (error) {
    console.error("[ERROR] Unexpected error in getArtistEmail:", error);
    return {
      email: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

export default getArtistEmail;
