"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getFormattedTracks_1 = __importDefault(require("./getFormattedTracks"));
const getTopTracks = async (artistId, accessToken, analysisId) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        const topTracks = data?.tracks || [];
        const formattedTracks = (0, getFormattedTracks_1.default)(topTracks, analysisId);
        return formattedTracks;
    }
    catch (error) {
        console.error(error);
        return { error };
    }
};
exports.default = getTopTracks;
