"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
const searchArtist_1 = __importDefault(require("./searchArtist"));
const getProfile = async (handle, accessToken) => {
    const artist = await (0, searchArtist_1.default)(handle, accessToken);
    if (artist?.error)
        throw new Error(artist?.error);
    return {
        profile: {
            name: artist.name,
            nickname: artist.name,
            avatar: artist.images?.[0]?.url || "",
            followers: artist.followers.total,
            bio: "",
            followings: 0,
            region: "",
        },
        artistId: artist.id,
    };
};
exports.getProfile = getProfile;
