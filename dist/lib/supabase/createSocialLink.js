"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_js_1 = __importDefault(require("./serverClient.js"));
const createSocialLink = async (artistId, social_type, social_link) => {
    const { data } = await serverClient_js_1.default
        .from("artist_social_links")
        .select("*")
        .eq("artistId", artistId)
        .eq("type", social_type);
    if (data && data?.length) {
        if (!social_link)
            return;
        await serverClient_js_1.default
            .from("artist_social_links")
            .update({
            ...data[0],
            link: social_link,
        })
            .eq("id", data[0].id);
        return;
    }
    await serverClient_js_1.default.from("artist_social_links").insert({
        link: social_link,
        type: social_type,
        artistId: artistId,
    });
};
exports.default = createSocialLink;
