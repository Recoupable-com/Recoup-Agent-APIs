import { Database } from "../../types/database.types";

type Social = Database["public"]["Tables"]["socials"]["Row"];

const getFormattedAccount = (
  data: any
): {
  profile: Social | null;
  videoUrls: Array<string> | null;
} | null => {
  try {
    console.log("getFormattedAccount: Starting TikTok account formatting", {
      hasData: !!data,
      dataLength: data?.length,
      firstItemAuthor: data?.[0]?.authorMeta
        ? {
            name: data[0].authorMeta.name,
            hasAvatar: !!data[0].authorMeta.avatar,
            avatarUrl: data[0].authorMeta.avatar,
          }
        : null,
    });

    const videoUrls: Array<string> = [];
    if (data?.length === 0 || data?.error) {
      console.warn("getFormattedAccount: No data or error in TikTok response", {
        error: data?.error,
        dataLength: data?.length,
      });
      return null;
    }

    const aggregatedData = data.reduce((acc: any, item: any) => {
      const existingAuthor = acc.find(
        (author: any) => author.name === item.authorMeta.name
      );

      videoUrls.push(item.webVideoUrl);
      if (!existingAuthor) {
        const authorData = {
          username: item.authorMeta.name,
          region: item.authorMeta.region,
          avatar: item.authorMeta.avatar,
          bio: item.authorMeta.signature,
          followerCount: item.authorMeta.fans,
          followingCount: item.authorMeta.following,
          profile_url: `https://tiktok.com/@${item.authorMeta.name}`,
        };

        console.log("getFormattedAccount: Processing TikTok author data", {
          username: authorData.username,
          hasAvatar: !!authorData.avatar,
          avatarUrl: authorData.avatar,
          hasFollowerCount: !!authorData.followerCount,
          hasBio: !!authorData.bio,
        });

        acc.push(authorData);
      }
      return acc;
    }, []);

    const profile = Object.values(aggregatedData)?.[0] as any;
    console.log("getFormattedAccount: Formatted TikTok profile result", {
      hasProfile: !!profile,
      username: profile?.username,
      hasAvatar: !!profile?.avatar,
      avatarUrl: profile?.avatar,
      followerCount: profile?.followerCount,
    });

    return {
      profile,
      videoUrls,
    };
  } catch (error) {
    console.error("getFormattedAccount: Error processing TikTok account", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      profile: null,
      videoUrls: null,
    };
  }
};

export default getFormattedAccount;
