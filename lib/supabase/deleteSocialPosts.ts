import supabase from "./serverClient";

/**
 * Deletes social_posts records for a given social_id and post_ids
 *
 * @param socialId - The social ID to delete connections for
 * @param postIds - Array of post IDs to delete connections for
 * @returns Promise resolving to void
 */
const deleteSocialPosts = async (
  socialId: string,
  postIds: string[]
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("social_posts")
      .delete()
      .eq("social_id", socialId)
      .in("post_id", postIds);

    if (error) {
      console.error("Error deleting social posts:", error);
    }
  } catch (error) {
    console.error("Error in deleteSocialPosts:", error);
  }
};

export default deleteSocialPosts;
