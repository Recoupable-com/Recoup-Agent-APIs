"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getSocialHandles_1 = __importDefault(require("../getSocialHandles"));
const getArtist_1 = __importDefault(require("../supabase/getArtist"));
const analyzeProfile_1 = __importDefault(require("./analyzeProfile"));
const getSocialProfile = async (chat_id, analysisId, handle, existingArtistId) => {
    let scrapedProfile, scrapedPostUrls, analyzedProfileError;
    const { profile, latestPosts, error } = await (0, analyzeProfile_1.default)(chat_id, analysisId, handle);
    scrapedProfile = profile;
    scrapedPostUrls = latestPosts;
    analyzedProfileError = error;
    if (!scrapedProfile || analyzedProfileError) {
        const existingArtist = await (0, getArtist_1.default)(existingArtistId);
        const handles = await (0, getSocialHandles_1.default)(existingArtist?.name || handle);
        const { profile, latestPosts, error } = await (0, analyzeProfile_1.default)(chat_id, analysisId, handles.instagram.replace(/@/g, ""));
        analyzedProfileError = error;
        scrapedProfile = profile;
        scrapedPostUrls = latestPosts;
    }
    return {
        scrapedProfile,
        analyzedProfileError,
        scrapedPostUrls,
    };
};
exports.default = getSocialProfile;
