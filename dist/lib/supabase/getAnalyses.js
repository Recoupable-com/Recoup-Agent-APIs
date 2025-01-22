"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_1 = __importDefault(require("./serverClient"));
const getAnalyses = async (chat_id) => {
    const { data } = await serverClient_1.default
        .from("funnel_analytics")
        .select(`*,
      funnel_analytics_segments (
        *
      ),
      funnel_analytics_profile (
        *,
        artists (
          *,
          artist_social_links (
            *
          )
        )
      ),
      funnel_analytics_comments (
        *
      ),
      spotify_analytics_albums (
        *
      ),
      spotify_analytics_tracks (
        *
      )`)
        .eq("chat_id", chat_id);
    return data;
};
exports.default = getAnalyses;
