"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_js_1 = __importDefault(require("./serverClient.js"));
const getArtist = async (artist_id) => {
    const { data } = await serverClient_js_1.default
        .from("artists")
        .select(`
        *,
        artist_social_links (
          *
        )
      `)
        .eq("id", artist_id)
        .single();
    return data;
};
exports.default = getArtist;
