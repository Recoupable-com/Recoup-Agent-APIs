"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const funnels_1 = require("../funnels");
const step_1 = require("../step");
const updateAnalysisStatus_1 = __importDefault(require("../supabase/updateAnalysisStatus"));
const getProfile_1 = __importDefault(require("./getProfile"));
const getProfileDatasetId_1 = __importDefault(require("./getProfileDatasetId"));
const analyzeProfile = async (chat_id, analysisId, handle) => {
    await (0, updateAnalysisStatus_1.default)(chat_id, analysisId, funnels_1.Funnel_Type.INSTAGRAM, step_1.STEP_OF_ANALYSIS.PROFILE);
    const profileDatasetId = await (0, getProfileDatasetId_1.default)(handle);
    const accountData = await (0, getProfile_1.default)(profileDatasetId, chat_id);
    if (accountData?.error) {
        return { error: accountData?.error, profile: null, latestPosts: null };
    }
    const profile = accountData?.profile;
    const latestPosts = accountData?.latestPosts;
    return {
        profile,
        latestPosts,
        error: false,
    };
};
exports.default = analyzeProfile;
