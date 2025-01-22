"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getSocialHandles_js_1 = __importDefault(require("../getSocialHandles.js"));
const getArtist_js_1 = __importDefault(require("../supabase/getArtist.js"));
const analyzeProfile_js_1 = __importDefault(require("./analyzeProfile.js"));
const getSocialProfile = async (chat_id, analysisId, handle, existingArtistId) => {
    let scrapedProfile, scrapedVideoUrls, analyzedProfileError;
    const { profile, videoUrls, error } = await (0, analyzeProfile_js_1.default)(chat_id, analysisId, handle);
    scrapedProfile = profile;
    scrapedVideoUrls = videoUrls;
    analyzedProfileError = error;
    if (!scrapedProfile || analyzedProfileError) {
        const existingArtist = await (0, getArtist_js_1.default)(existingArtistId);
        const handles = await (0, getSocialHandles_js_1.default)(existingArtist?.name || handle);
        const { profile, videoUrls, error } = await (0, analyzeProfile_js_1.default)(chat_id, analysisId, handles.tiktok.replace(/@/g, ""));
        analyzedProfileError = error;
        scrapedProfile = profile;
        scrapedVideoUrls = videoUrls;
    }
    return {
        scrapedProfile,
        analyzedProfileError,
        scrapedVideoUrls,
    };
};
exports.default = getSocialProfile;
