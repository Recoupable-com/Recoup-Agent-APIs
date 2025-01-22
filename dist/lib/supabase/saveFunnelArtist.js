"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const funnels_1 = require("../funnels");
const serverClient_1 = __importDefault(require("./serverClient"));
const updateArtistProfile_1 = __importDefault(require("./updateArtistProfile"));
const updateArtistSocials_1 = __importDefault(require("./updateArtistSocials"));
const saveFunnelArtist = async (funnelType, nickname, avatar, instruction, label, knowledges, url, accountId = null, existingArtistId) => {
    let socialUrls = {
        twitter_url: "",
        tiktok_url: "",
        spotify_url: "",
        instagram_url: "",
    };
    if (funnelType === funnels_1.Funnel_Type.TIKTOK)
        socialUrls.tiktok_url = url;
    if (funnelType === funnels_1.Funnel_Type.TWITTER)
        socialUrls.twitter_url = url;
    if (funnelType === funnels_1.Funnel_Type.SPOTIFY)
        socialUrls.spotify_url = url;
    if (funnelType === funnels_1.Funnel_Type.INSTAGRAM)
        socialUrls.instagram_url = url;
    if (!funnelType)
        socialUrls = url;
    const id = await (0, updateArtistProfile_1.default)(accountId, avatar, nickname, instruction, label, knowledges, existingArtistId);
    await (0, updateArtistSocials_1.default)(id, socialUrls.tiktok_url, "", "", socialUrls.instagram_url, socialUrls.twitter_url, socialUrls.spotify_url);
    const { data } = await serverClient_1.default
        .from("artists")
        .select(`
        *,
        artist_social_links (
          *
        )
      `)
        .eq("id", id)
        .single();
    return data;
};
exports.default = saveFunnelArtist;
