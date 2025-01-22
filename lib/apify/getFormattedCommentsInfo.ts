const getFormattedCommentsInfo = (data: any) => {
  let totalComments = 0;
  const aggregated: any = {};
  const sorteddata = data.sort(
    (a: any, b: any) => b?.createTime || 0 - a?.createTime || 0,
  );

  sorteddata.forEach((comment: any) => {
    const { videoWebUrl, text, uniqueId, createTime } = comment;

    if (!aggregated[videoWebUrl]) {
      aggregated[videoWebUrl] = {
        videoWebUrl,
        comments: [],
      };
    }

    if (text) {
      totalComments++;
      aggregated[videoWebUrl].comments.push({
        comment: text,
        username: uniqueId,
        created_at: createTime,
      });
    }
  });

  return {
    videos: Object.values(aggregated),
    totalComments,
  };
};

export default getFormattedCommentsInfo;
