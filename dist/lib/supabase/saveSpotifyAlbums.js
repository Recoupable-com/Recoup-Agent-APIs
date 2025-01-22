"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_1 = __importDefault(require("./serverClient"));
const saveSpotifyAlbums = async (albums) => {
    const { data } = await serverClient_1.default
        .from("spotify_analytics_albums")
        .insert(albums)
        .select("*");
    return data;
};
exports.default = saveSpotifyAlbums;
