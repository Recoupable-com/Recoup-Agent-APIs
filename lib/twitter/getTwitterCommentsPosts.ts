const getTwitterCommentsPosts = (allTweets: any) => {
  const postUrls: string[] = [];
  const comments = allTweets.map((tweet: any) => {
    postUrls.push(tweet.permanentUrl);
    if (tweet.username)
      return {
        comment: tweet.text,
        commented_at: new Date(tweet.createdAt).toISOString(),
        username: tweet.username,
        profile_url: `https://x.com/${tweet.username}`,
        post_url: tweet.permanentUrl,
      };
    return null;
  });

  return {
    comments: comments.filter((comment: any) => comment !== null),
    postUrls: [...new Set(postUrls)],
  };
};

export default getTwitterCommentsPosts;
