"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAggregatedSocials_1 = __importDefault(require("./getAggregatedSocials"));
const getAggregatedProfile = (artist, existingArtist) => {
    const aggregatedArtistProfile = existingArtist
        ? {
            ...artist,
            ...existingArtist,
            image: existingArtist?.image || artist?.image || "",
            artist_social_links: (0, getAggregatedSocials_1.default)([
                ...(existingArtist?.artist_social_links || []),
                ...artist.artist_social_links,
            ]),
        }
        : artist;
    return aggregatedArtistProfile;
};
exports.default = getAggregatedProfile;
