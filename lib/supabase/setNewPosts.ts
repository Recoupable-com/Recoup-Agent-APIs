import { AgentServiceResult } from "../types/agent.types";
import { Database } from "../../types/database.types";
import supabase from "./serverClient";

type DbPost = Database["public"]["Tables"]["posts"]["Row"];

const setNewPosts = async (
  postUrls: Array<string>
): Promise<AgentServiceResult<DbPost[]>> => {
  try {
    let allPosts: DbPost[] = [];
    const chunkSize = 100;
    const chunkCount =
      parseInt(Number(postUrls.length / chunkSize).toFixed(0), 10) + 1;

    for (let i = 0; i < chunkCount; i++) {
      const chunkPostUrls = postUrls.slice(chunkSize * i, chunkSize * (i + 1));
      const { data: existing_posts, error: selectError } = await supabase
        .from("posts")
        .select("*, post_comments(*)")
        .in("post_url", chunkPostUrls);

      if (selectError) {
        console.error("Error fetching existing posts:", selectError);
        continue;
      }

      const missing_post_urls = chunkPostUrls.filter(
        (postUrl) =>
          !existing_posts?.some(
            (existing_post) => existing_post.post_url === postUrl
          )
      );

      if (missing_post_urls.length > 0) {
        const missing_posts = missing_post_urls.map((missing_post_url) => ({
          post_url: missing_post_url,
        }));

        const { data: created_posts, error: insertError } = await supabase
          .from("posts")
          .insert(missing_posts)
          .select();

        if (insertError) {
          console.error("Error inserting new posts:", insertError);
          continue;
        }

        if (created_posts) {
          allPosts = allPosts.concat(created_posts);
        }
      }

      // Add existing posts to the result
      if (existing_posts) {
        allPosts = allPosts.concat(existing_posts);
      }
    }

    return { data: allPosts, error: null };
  } catch (error) {
    console.error("Error in setNewPosts:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error in setNewPosts"),
    };
  }
};

export default setNewPosts;
