"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const step_1 = require("../lib/step");
const beginAnalysis_1 = __importDefault(require("../lib/supabase/beginAnalysis"));
const updateAnalysisStatus_1 = __importDefault(require("../lib/supabase/updateAnalysisStatus"));
const getSegments_1 = __importDefault(require("../lib/getSegments"));
const getSegmentsWithIcons_1 = __importDefault(require("../lib/getSegmentsWithIcons"));
const saveFunnelSegments_1 = __importDefault(require("../lib/supabase/saveFunnelSegments"));
const funnels_1 = require("../lib/funnels");
const saveFunnelProfile_1 = __importDefault(require("../lib/supabase/saveFunnelProfile"));
const trackFunnelAnalysisChat_1 = __importDefault(require("../lib/stack/trackFunnelAnalysisChat"));
const saveFunnelArtist_1 = __importDefault(require("../lib/supabase/saveFunnelArtist"));
const getProfile_1 = require("../lib/spotify/getProfile");
const getAccessToken_1 = __importDefault(require("../lib/supabase/getAccessToken"));
const getAlbums_1 = __importDefault(require("../lib/spotify/getAlbums"));
const getTopTracks_1 = __importDefault(require("../lib/spotify/getTopTracks"));
const saveSpotifyAlbums_1 = __importDefault(require("../lib/supabase/saveSpotifyAlbums"));
const saveSpotifyTracks_1 = __importDefault(require("../lib/supabase/saveSpotifyTracks"));
const createWrappedAnalysis_1 = __importDefault(require("./createWrappedAnalysis"));
const getArtist_1 = __importDefault(require("../lib/supabase/getArtist"));
const getSpotifyAnalysis = async (handle, chat_id, account_id, address, isWrapped, existingArtistId = null) => {
    const newAnalysis = await (0, beginAnalysis_1.default)(chat_id, handle, funnels_1.Funnel_Type.SPOTIFY);
    const analysisId = newAnalysis.id;
    try {
        const existingArtist = await (0, getArtist_1.default)(existingArtistId);
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.PROFILE);
        const accessToken = await (0, getAccessToken_1.default)();
        const data = await (0, getProfile_1.getProfile)(handle, accessToken);
        const profile = data.profile;
        const artistUri = data.artistId;
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.CREATING_ARTIST);
        const newArtist = await (0, saveFunnelArtist_1.default)(funnels_1.Funnel_Type.SPOTIFY, existingArtist?.name || profile?.nickname, existingArtist?.image || profile?.avatar, existingArtist?.instruction || "", existingArtist?.label || "", existingArtist?.knowledges || [], `https://open.spotify.com/artist/${artistUri}`, account_id, existingArtistId);
        await (0, saveFunnelProfile_1.default)({
            ...profile,
            type: "SPOTIFY",
            analysis_id: analysisId,
            artistId: newArtist.id,
        });
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.CREATED_ARTIST, 0, newArtist);
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.ALBUMS);
        const albums = await (0, getAlbums_1.default)(artistUri, accessToken, analysisId);
        await (0, saveSpotifyAlbums_1.default)(albums);
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.TRACKS);
        const tracks = await (0, getTopTracks_1.default)(artistUri, accessToken, analysisId);
        await (0, saveSpotifyTracks_1.default)(tracks);
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.SEGMENTS);
        const segments = await (0, getSegments_1.default)([...tracks, ...albums]);
        const segmentsWithIcons = await (0, getSegmentsWithIcons_1.default)(segments, analysisId);
        await (0, saveFunnelSegments_1.default)(segmentsWithIcons);
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.SAVING_ANALYSIS);
        await (0, trackFunnelAnalysisChat_1.default)(address, handle, newArtist?.id, chat_id, isWrapped ? "Wrapped" : "Spotify");
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.FINISHED);
        if (isWrapped)
            await (0, createWrappedAnalysis_1.default)(handle, chat_id, account_id, address, existingArtistId);
        return;
    }
    catch (error) {
        console.error(error);
        await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.SPOTIFY, step_1.STEP_OF_ANALYSIS.ERROR);
    }
};
exports.default = getSpotifyAnalysis;
