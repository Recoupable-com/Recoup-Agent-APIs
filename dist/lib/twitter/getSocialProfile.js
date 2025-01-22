"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const funnels_1 = require("../funnels");
const step_1 = require("../step");
const getArtist_1 = __importDefault(require("../supabase/getArtist"));
const updateAnalysisStatus_1 = __importDefault(require("../supabase/updateAnalysisStatus"));
const getFormattedProfile_1 = __importDefault(require("./getFormattedProfile"));
const getSocialHandles_1 = __importDefault(require("../getSocialHandles"));
const getSocialProfile = async (scraper, chat_id, analysisId, handle, existingArtistId) => {
    let scrapedProfile;
    await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.TWITTER, step_1.STEP_OF_ANALYSIS.PROFILE);
    try {
        scrapedProfile = await scraper.getProfile(handle);
    }
    catch (error) {
        console.error(error);
        const existingArtist = await (0, getArtist_1.default)(existingArtistId);
        const handles = await (0, getSocialHandles_1.default)(existingArtist?.name || handle);
        scrapedProfile = await scraper.getProfile(handles.twitter.replace(/@/g, ""));
    }
    return (0, getFormattedProfile_1.default)(scrapedProfile);
};
exports.default = getSocialProfile;
