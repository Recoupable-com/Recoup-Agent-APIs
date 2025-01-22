"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const funnels_js_1 = require("../funnels.js");
const step_js_1 = require("../step.js");
const saveFunnelComments_js_1 = __importDefault(require("../supabase/saveFunnelComments.js"));
const updateAnalysisStatus_js_1 = __importDefault(require("../supabase/updateAnalysisStatus.js"));
const getAllTweets_js_1 = __importDefault(require("./getAllTweets.js"));
const getTwitterComments_js_1 = __importDefault(require("./getTwitterComments.js"));
const analyzeComments = async (scraper, chat_id, analysisId, handle) => {
    await (0, updateAnalysisStatus_js_1.default)(chat_id, analysisId, funnels_js_1.Funnel_Type.TWITTER, step_js_1.STEP_OF_ANALYSIS.POST_COMMENTS);
    const allTweets = await (0, getAllTweets_js_1.default)(scraper, handle);
    const comments = (0, getTwitterComments_js_1.default)(allTweets, analysisId);
    await (0, saveFunnelComments_js_1.default)(comments);
    return comments;
};
exports.default = analyzeComments;
