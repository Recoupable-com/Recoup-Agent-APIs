"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uploadPfpToIpfs_js_1 = __importDefault(require("./ipfs/uploadPfpToIpfs.js"));
const step_js_1 = require("./step.js");
const getArtist_js_1 = __importDefault(require("./supabase/getArtist.js"));
const saveFunnelArtist_js_1 = __importDefault(require("./supabase/saveFunnelArtist.js"));
const saveFunnelProfile_js_1 = __importDefault(require("./supabase/saveFunnelProfile.js"));
const updateAnalysisStatus_js_1 = __importDefault(require("./supabase/updateAnalysisStatus.js"));
const createArtist = async (chat_id, analysisId, account_id, existingArtistId, profile, funnel_type, socialUrl) => {
    try {
        const existingArtist = await (0, getArtist_js_1.default)(existingArtistId);
        const avatar = await (0, uploadPfpToIpfs_js_1.default)(profile.avatar);
        await (0, updateAnalysisStatus_js_1.default)(chat_id, analysisId, funnel_type, step_js_1.STEP_OF_ANALYSIS.CREATING_ARTIST);
        const newArtist = await (0, saveFunnelArtist_js_1.default)(funnel_type, existingArtist?.name || profile?.nickname, existingArtist?.image || avatar, existingArtist?.instruction || "", existingArtist?.label || "", existingArtist?.knowledges || [], socialUrl, account_id, existingArtistId);
        await (0, saveFunnelProfile_js_1.default)({
            ...profile,
            avatar,
            type: funnel_type.toUpperCase(),
            analysis_id: analysisId,
            artistId: newArtist.id,
        });
        await (0, updateAnalysisStatus_js_1.default)(chat_id, analysisId, funnel_type, step_js_1.STEP_OF_ANALYSIS.CREATED_ARTIST, 0, newArtist);
        return newArtist;
    }
    catch (error) {
        console.error(error);
        throw Error(error);
    }
};
exports.default = createArtist;
