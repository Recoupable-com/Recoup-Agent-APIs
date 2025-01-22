const getFormattedAccount = (data: any) => {
  try {
    const videoUrls: any = [];
    if (data?.length === 0 || data?.error) return null;
    const aggregatedData = data.reduce((acc: any, item: any) => {
      const existingAuthor = acc.find(
        (author: any) => author.name === item.authorMeta.name,
      );

      videoUrls.push(item.webVideoUrl);
      if (!existingAuthor) {
        acc.push({
          name: item.authorMeta.name,
          nickname: item.authorMeta.nickName,
          region: item.authorMeta.region,
          avatar: item.authorMeta.avatar,
          bio: item.authorMeta.signature,
          followers: item.authorMeta.fans,
          followings: item.authorMeta.following,
        });
      }
      return acc;
    }, []);

    return {
      profile: Object.values(aggregatedData),
      videoUrls,
    };
  } catch (error) {
    return null;
  }
};

export default getFormattedAccount;
