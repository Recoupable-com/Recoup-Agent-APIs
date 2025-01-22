"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getSegments_js_1 = __importDefault(require("./getSegments.js"));
const getSegmentsWithIcons_js_1 = __importDefault(require("./getSegmentsWithIcons.js"));
const step_js_1 = require("./step.js");
const saveFunnelSegments_js_1 = __importDefault(require("./supabase/saveFunnelSegments.js"));
const updateAnalysisStatus_js_1 = __importDefault(require("./supabase/updateAnalysisStatus.js"));
const analyzeSegments = async (chat_id, analysisId, videoComments, funnel_type) => {
    await (0, updateAnalysisStatus_js_1.default)(chat_id, analysisId, funnel_type, step_js_1.STEP_OF_ANALYSIS.SEGMENTS);
    const segments = await (0, getSegments_js_1.default)(videoComments);
    const segmentsWithIcons = await (0, getSegmentsWithIcons_js_1.default)(segments, analysisId);
    await (0, saveFunnelSegments_js_1.default)(segmentsWithIcons);
    await (0, updateAnalysisStatus_js_1.default)(chat_id, analysisId, funnel_type, step_js_1.STEP_OF_ANALYSIS.SAVING_ANALYSIS);
};
exports.default = analyzeSegments;
