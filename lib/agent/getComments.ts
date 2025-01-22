const getComments = (funnel_analyses: any) => {
  const comments_albums_tracks: any = [];
  funnel_analyses.map((funnel_analysis: any) => {
    comments_albums_tracks.push(funnel_analysis.funnel_analytics_comments);
    comments_albums_tracks.push(funnel_analysis.spotify_analytics_albums);
    comments_albums_tracks.push(funnel_analysis.spotify_analytics_tracks);
  });

  return comments_albums_tracks.flat();
};

export default getComments;
