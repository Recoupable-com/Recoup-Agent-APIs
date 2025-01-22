"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getSegments_1 = __importDefault(require("../lib/getSegments"));
const getSegmentsWithIcons_1 = __importDefault(require("../lib/getSegmentsWithIcons"));
const trackFunnelAnalysisChat_1 = __importDefault(require("../lib/stack/trackFunnelAnalysisChat"));
const beginAnalysis_1 = __importDefault(require("../lib/supabase/beginAnalysis"));
const saveFunnelProfile_1 = __importDefault(require("../lib/supabase/saveFunnelProfile"));
const saveFunnelSegments_1 = __importDefault(require("../lib/supabase/saveFunnelSegments"));
const getAnalyses_1 = __importDefault(require("../lib/supabase/getAnalyses"));
const getAggregatedArtist_1 = __importDefault(require("../lib/agent/getAggregatedArtist"));
const getArtist_1 = __importDefault(require("../lib/supabase/getArtist"));
const getAggregatedProfile_1 = __importDefault(require("../lib/agent/getAggregatedProfile"));
const updateArtistProfile_1 = __importDefault(require("../lib/supabase/updateArtistProfile"));
const createSocialLink_1 = __importDefault(require("../lib/supabase/createSocialLink"));
const getComments_1 = __importDefault(require("../lib/agent/getComments"));
const getAggregatedSocialProfile_1 = __importDefault(require("../lib/agent/getAggregatedSocialProfile"));
const checkWrappedCompleted_1 = __importDefault(require("../lib/agent/checkWrappedCompleted"));
const step_1 = require("../lib/step");
const updateAnalysisStatus_1 = __importDefault(require("../lib/supabase/updateAnalysisStatus"));
const funnels_1 = require("../lib/funnels");
const createWrappedAnalysis = async (handle, chat_id, account_id, address, existingArtistId) => {
    const funnel_analyses = await (0, getAnalyses_1.default)(chat_id);
    const wrappedCompleted = (0, checkWrappedCompleted_1.default)(funnel_analyses);
    if (!wrappedCompleted)
        return;
    const newAnalysis = await (0, beginAnalysis_1.default)(chat_id, handle);
    const analysisId = newAnalysis.id;
    try {
        const artist = (0, getAggregatedArtist_1.default)(funnel_analyses);
        const existingArtist = await (0, getArtist_1.default)(existingArtistId);
        const aggregatedArtistProfile = (0, getAggregatedProfile_1.default)(artist, existingArtist);
        const artistId = await (0, updateArtistProfile_1.default)(account_id, aggregatedArtistProfile.image, aggregatedArtistProfile.name, aggregatedArtistProfile.instruction, aggregatedArtistProfile.label, aggregatedArtistProfile.knowledges, existingArtistId);
        aggregatedArtistProfile.artist_social_links.forEach(async (link) => {
            await (0, createSocialLink_1.default)(artistId, link.type, link.link);
        });
        const aggregatedSocialProfile = (0, getAggregatedSocialProfile_1.default)(funnel_analyses, existingArtist);
        await (0, saveFunnelProfile_1.default)({
            ...aggregatedSocialProfile,
            analysis_id: analysisId,
            artistId: artistId,
        });
        const comments = (0, getComments_1.default)(funnel_analyses);
        const segments = await (0, getSegments_1.default)(comments.slice(0, 500));
        const segmentsWithIcons = await (0, getSegmentsWithIcons_1.default)(segments, analysisId);
        await (0, saveFunnelSegments_1.default)(segmentsWithIcons);
        if (address) {
            await (0, trackFunnelAnalysisChat_1.default)(address, handle, artistId, chat_id, "Wrapped");
        }
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.WRAPPED, step_1.STEP_OF_ANALYSIS.WRAPPED_COMPLETED);
        return;
    }
    catch (error) {
        console.error(error);
    }
};
exports.default = createWrappedAnalysis;
