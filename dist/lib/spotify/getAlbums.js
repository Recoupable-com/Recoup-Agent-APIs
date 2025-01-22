"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getFormattedAlbums_1 = __importDefault(require("./getFormattedAlbums"));
const getAlbums = async (artistId, accessToken, analysisId) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok)
            return { error: true };
        const data = await response.json();
        const formattedSavedAlbums = (0, getFormattedAlbums_1.default)(data?.items || [], analysisId);
        return formattedSavedAlbums;
    }
    catch (error) {
        console.error(error);
        return { error };
    }
};
exports.default = getAlbums;
