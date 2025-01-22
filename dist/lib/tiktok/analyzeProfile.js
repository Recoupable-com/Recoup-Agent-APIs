"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const funnels_js_1 = require("../funnels.js");
const step_js_1 = require("../step.js");
const updateAnalysisStatus_js_1 = __importDefault(require("../supabase/updateAnalysisStatus.js"));
const getProfile_js_1 = __importDefault(require("./getProfile.js"));
const getProfileDatasetId_js_1 = __importDefault(require("./getProfileDatasetId.js"));
const analyzeProfile = async (chat_id, analysisId, handle) => {
    await (0, updateAnalysisStatus_js_1.default)(chat_id, analysisId, funnels_js_1.Funnel_Type.TIKTOK, step_js_1.STEP_OF_ANALYSIS.PROFILE);
    const profileDatasetId = await (0, getProfileDatasetId_js_1.default)(handle);
    const accountData = await (0, getProfile_js_1.default)(profileDatasetId);
    if (accountData?.error) {
        return { error: accountData?.error, profile: null, videoUrls: null };
    }
    const profile = accountData?.profile?.[0];
    const videoUrls = accountData?.videoUrls;
    return {
        profile,
        videoUrls,
        error: false,
    };
};
exports.default = analyzeProfile;
