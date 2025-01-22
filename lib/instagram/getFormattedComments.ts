const getFormattedComments = (data: any, analysis_id: string) => {
  if (data?.error) return [];
  const sorteddata = data
    .sort(
      (a: any, b: any) =>
        new Date(b?.timestamp).getTime() ||
        0 - new Date(a?.timestamp).getTime() ||
        0,
    )
    .filter((item: any) => item?.postUrl);

  const comments = sorteddata.map((comment: any) => {
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
