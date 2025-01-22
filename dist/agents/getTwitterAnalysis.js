"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agent_twitter_client_1 = require("agent-twitter-client");
const step_1 = require("../lib/step");
const beginAnalysis_1 = __importDefault(require("../lib/supabase/beginAnalysis"));
const updateAnalysisStatus_1 = __importDefault(require("../lib/supabase/updateAnalysisStatus"));
const funnels_1 = require("../lib/funnels");
const trackFunnelAnalysisChat_1 = __importDefault(require("../lib/stack/trackFunnelAnalysisChat"));
const createWrappedAnalysis_1 = __importDefault(require("./createWrappedAnalysis"));
const createArtist_1 = __importDefault(require("../lib/createArtist"));
const analyzeComments_1 = __importDefault(require("../lib/twitter/analyzeComments"));
const analyzeSegments_1 = __importDefault(require("../lib/analyzeSegments"));
const getSocialProfile_1 = __importDefault(require("../lib/twitter/getSocialProfile"));
const scraper = new agent_twitter_client_1.Scraper();
const getTwitterAnalysis = async (handle, chat_id, account_id, address, isWrapped, existingArtistId = null) => {
    const newAnalysis = await (0, beginAnalysis_1.default)(chat_id, handle, funnels_1.Funnel_Type.TWITTER);
    const analysisId = newAnalysis.id;
    try {
        const scrappedProfile = await (0, getSocialProfile_1.default)(scraper, chat_id, analysisId, handle, existingArtistId);
        const newArtist = await (0, createArtist_1.default)(chat_id, analysisId, account_id, existingArtistId, scrappedProfile, "twitter", `https://x.com/${scrappedProfile?.name}`);
        const comments = await (0, analyzeComments_1.default)(scraper, chat_id, analysisId, handle);
        await (0, analyzeSegments_1.default)(chat_id, analysisId, comments, funnels_1.Funnel_Type.TWITTER);
        await (0, trackFunnelAnalysisChat_1.default)(address, handle, newArtist?.id, chat_id, isWrapped ? "Wrapped" : "Twitter");
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.TWITTER, step_1.STEP_OF_ANALYSIS.FINISHED);
        if (isWrapped)
            await (0, createWrappedAnalysis_1.default)(handle, chat_id, account_id, address, existingArtistId);
        return;
    }
    catch (error) {
        console.error(error);
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.TWITTER, step_1.STEP_OF_ANALYSIS.ERROR);
    }
};
exports.default = getTwitterAnalysis;
