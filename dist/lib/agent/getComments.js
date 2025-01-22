"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getComments = (funnel_analyses) => {
    const comments_albums_tracks = [];
    funnel_analyses.map((funnel_analysis) => {
        comments_albums_tracks.push(funnel_analysis.funnel_analytics_comments);
        comments_albums_tracks.push(funnel_analysis.spotify_analytics_albums);
        comments_albums_tracks.push(funnel_analysis.spotify_analytics_tracks);
    });
    return comments_albums_tracks.flat();
};
exports.default = getComments;
