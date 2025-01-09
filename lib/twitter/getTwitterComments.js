const getTwitterComments = (allTweets, analysis_id) => {
  const comments = allTweets?.map((tweet) => ({
    comment: tweet.text,
    timestamp: new Date(tweet.createdAt).getTime(),
    username: tweet.username,
    analysis_id,
    post_url: tweet.permanentUrl,
    type: "TWITTER",
  }));

  return comments;
};

export default getTwitterComments;
