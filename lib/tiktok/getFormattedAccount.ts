import { Database } from "../../types/database.types";

type Social = Database["public"]["Tables"]["socials"]["Row"];

const getFormattedAccount = (
  data: any,
): {
  profile: Social;
  videoUrls: Array<string>;
} | null => {
  try {
    const videoUrls: Array<string> = [];
    if (data?.length === 0 || data?.error) return null;
    const aggregatedData = data.reduce((acc: any, item: any) => {
      const existingAuthor = acc.find(
        (author: any) => author.name === item.authorMeta.name,
      );

      videoUrls.push(item.webVideoUrl);
      if (!existingAuthor) {
        acc.push({
          username: item.authorMeta.name,
          region: item.authorMeta.region,
          avatar: item.authorMeta.avatar,
          bio: item.authorMeta.signature,
          followerCount: item.authorMeta.fans,
          followingCount: item.authorMeta.following,
          profile_url: `https://tiktok.com/@${item.authorMeta.name}`,
        });
      }
      return acc;
    }, []);

    return {
      profile: Object.values(aggregatedData)?.[0] as any,
      videoUrls,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getFormattedAccount;
