"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const funnels_1 = require("../lib/funnels");
const trackFunnelAnalysisChat_1 = __importDefault(require("../lib/stack/trackFunnelAnalysisChat"));
const step_1 = require("../lib/step");
const beginAnalysis_1 = __importDefault(require("../lib/supabase/beginAnalysis"));
const updateAnalysisStatus_1 = __importDefault(require("../lib/supabase/updateAnalysisStatus"));
const analyzeSegments_1 = __importDefault(require("../lib/analyzeSegments"));
const analyzeVideoComments_1 = __importDefault(require("../lib/tiktok/analyzeVideoComments"));
const createArtist_1 = __importDefault(require("../lib/createArtist"));
const createWrappedAnalysis_1 = __importDefault(require("./createWrappedAnalysis"));
const getSocialProfile_1 = __importDefault(require("../lib/tiktok/getSocialProfile"));
const getTikTokAnalysis = async (handle, chat_id, account_id, address, isWrapped, existingArtistId = null) => {
    const newAnalysis = await (0, beginAnalysis_1.default)(chat_id, handle, funnels_1.Funnel_Type.TIKTOK);
    const analysisId = newAnalysis.id;
    try {
        const { scrapedVideoUrls, scrapedProfile, analyzedProfileError } = await (0, getSocialProfile_1.default)(chat_id, analysisId, handle, existingArtistId);
        if (!scrapedProfile || analyzedProfileError) {
            await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.INSTAGRAM, analyzedProfileError?.status);
            return;
        }
        const newArtist = await (0, createArtist_1.default)(chat_id, analysisId, account_id, existingArtistId, scrapedProfile, "tiktok", `https://tiktok.com/@${scrapedProfile?.name}`);
        const videoComments = await (0, analyzeVideoComments_1.default)(scrapedVideoUrls, chat_id, analysisId);
        await (0, analyzeSegments_1.default)(chat_id, analysisId, videoComments, funnels_1.Funnel_Type.TIKTOK);
        await (0, trackFunnelAnalysisChat_1.default)(address, handle, newArtist?.id, chat_id, isWrapped ? "Wrapped" : "TikTok");
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.TIKTOK, step_1.STEP_OF_ANALYSIS.FINISHED);
        if (isWrapped)
            await (0, createWrappedAnalysis_1.default)(handle, chat_id, account_id, address, existingArtistId);
        return;
    }
    catch (error) {
        console.error(error);
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.TIKTOK, step_1.STEP_OF_ANALYSIS.ERROR);
    }
};
exports.default = getTikTokAnalysis;
