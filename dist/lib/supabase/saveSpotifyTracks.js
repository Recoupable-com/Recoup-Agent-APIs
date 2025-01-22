"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_1 = __importDefault(require("./serverClient"));
const saveSpotifyTracks = async (tracks) => {
    const { data } = await serverClient_1.default
        .from("spotify_analytics_tracks")
        .insert(tracks)
        .select("*");
    return data;
};
exports.default = saveSpotifyTracks;
