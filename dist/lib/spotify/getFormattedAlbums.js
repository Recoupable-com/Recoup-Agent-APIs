"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFormattedAlbums = (albums, analysis_id) => {
    return albums.map((album) => ({
        name: album.name,
        uri: album.uri,
        release_date: album.release_date,
        artist_name: album.artists?.[0]?.name,
        analysis_id,
    }));
};
exports.default = getFormattedAlbums;
