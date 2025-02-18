import supabase from "./serverClient";
import { getProfileUrl } from "../utils/getProfileUrl";
import getSocialPlatformByLink from "../getSocialPlatformByLink";
import { CommentInput } from "./savePostComments";
import { isValidPlatform } from "../utils/validatePlatform";

const createOrGetCommentSocials = async (
  comments: CommentInput[]
): Promise<{ [username: string]: string }> => {
  try {
    const uniqueAuthors = [...new Set(comments.map((c) => c.ownerUsername))]
      .map((username) => {
        const comment = comments.find((c) => c.ownerUsername === username);
        if (!comment) {
          throw new Error(`No comment found for username ${username}`);
        }

        const platform = getSocialPlatformByLink(comment.postUrl);
        if (!isValidPlatform(platform)) {
          console.warn(
            `Could not detect valid platform for ${username} from ${comment.postUrl}`
          );
          return null;
        }

        return {
          username,
          platform,
          profile_url: getProfileUrl(platform, username),
        };
      })
      .filter(
        (author): author is NonNullable<typeof author> => author !== null
      );

    if (uniqueAuthors.length === 0) {
      console.warn("No valid authors found after platform detection");
      return {};
    }

    // First try to get existing social records
    const { data: existingSocials, error: selectError } = await supabase
      .from("socials")
      .select("id, username, profile_url")
      .in(
        "username",
        uniqueAuthors.map((a) => a.username)
      );

    if (selectError) {
      console.error("Failed to fetch existing socials:", selectError);
      return {};
    }

    const existingSocialMap = existingSocials.reduce<{
      [username: string]: string;
    }>((acc, social) => {
      acc[social.username] = social.id;
      return acc;
    }, {});

    const authorsToCreate = uniqueAuthors.filter(
      (author) => !existingSocialMap[author.username]
    );

    if (authorsToCreate.length > 0) {
      const { data: newSocials, error: insertError } = await supabase
        .from("socials")
        .insert(
          authorsToCreate.map((author) => ({
            username: author.username,
            profile_url: author.profile_url,
          }))
        )
        .select("id, username");

      if (insertError) {
        console.error("Failed to create new socials:", insertError);
        return existingSocialMap;
      }

      newSocials?.forEach((social) => {
        existingSocialMap[social.username] = social.id;
      });
    }

    return existingSocialMap;
  } catch (error) {
    console.error("Error in createOrGetCommentSocials:", error);
    return {};
  }
};

export default createOrGetCommentSocials;
