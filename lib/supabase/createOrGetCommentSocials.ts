import supabase from "./serverClient";

const createOrGetCommentSocials = async (
  comments: Array<{
    ownerUsername: string;
  }>,
): Promise<{ [username: string]: string }> => {
  try {
    // Get unique usernames
    const usernames = [
      ...new Set(comments.map((comment) => comment.ownerUsername)),
    ];

    // First try to get existing social records
    const { data: existingSocials, error: fetchError } = await supabase
      .from("socials")
      .select("id, username")
      .in("username", usernames);

    if (fetchError) {
      console.error("Failed to fetch existing socials:", fetchError);
      return {};
    }

    // Create a map of existing username to social id
    const usernameToId = existingSocials.reduce(
      (acc: { [key: string]: string }, social) => {
        acc[social.username] = social.id;
        return acc;
      },
      {},
    );

    // Find usernames that don't have social records yet
    const missingUsernames = usernames.filter(
      (username) => !usernameToId[username],
    );

    if (missingUsernames.length > 0) {
      // Create new social records for missing usernames
      const { data: newSocials, error: insertError } = await supabase
        .from("socials")
        .upsert(
          missingUsernames.map((username) => ({
            username,
            profile_url: `https://instagram.com/${username}`,
          })),
        )
        .select("id, username");

      if (insertError) {
        console.error("Failed to create new socials:", insertError);
      } else if (newSocials) {
        // Add new socials to the map
        newSocials.forEach((social) => {
          usernameToId[social.username] = social.id;
        });
      }
    }

    return usernameToId;
  } catch (error) {
    console.error("Error in createOrGetCommentSocials:", error);
    return {};
  }
};

export default createOrGetCommentSocials;
