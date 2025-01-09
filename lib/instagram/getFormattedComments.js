const getFormattedComments = (data, analysis_id) => {
  console.log("ZIAD INSTAGRAM", data);
  if (!data) return [];
  const sorteddata = data
    .sort(
      (a, b) =>
        new Date(b?.timestamp).getTime() ||
        0 - new Date(a?.timestamp).getTime() ||
        0,
    )
    .filter((item) => item?.postUrl);

  const comments = sorteddata.map((comment) => {
    const { postUrl, text, timestamp, ownerUsername } = comment;
    return {
      comment: text || "",
      username: ownerUsername || "",
      post_url: postUrl || "",
      type: "INSTAGRAM",
      analysis_id,
      timestamp: new Date(timestamp).getTime(),
    };
  });

  return comments;
};

export default getFormattedComments;
