"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getActorStatus_js_1 = __importDefault(require("../apify/getActorStatus.js"));
const getDataset_js_1 = __importDefault(require("../apify/getDataset.js"));
const funnels_js_1 = require("../funnels.js");
const step_js_1 = require("../step.js");
const updateAnalysisStatus_js_1 = __importDefault(require("../supabase/updateAnalysisStatus.js"));
const getFormattedComments_js_1 = __importDefault(require("./getFormattedComments.js"));
const getPostComments = async (datasetId, chat_id = null, analysisId) => {
    try {
        let attempts = 0;
        const maxAttempts = 30;
        let progress = 0;
        while (1) {
            attempts++;
            progress = (attempts / maxAttempts) * 100;
            if (progress < 20)
                await (0, updateAnalysisStatus_js_1.default)(chat_id, analysisId, funnels_js_1.Funnel_Type.INSTAGRAM, step_js_1.STEP_OF_ANALYSIS.POSTURLS, progress);
            if (progress > 20)
                await (0, updateAnalysisStatus_js_1.default)(chat_id, analysisId, funnels_js_1.Funnel_Type.INSTAGRAM, step_js_1.STEP_OF_ANALYSIS.POST_COMMENTS, progress);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const data = await (0, getDataset_js_1.default)(datasetId);
            const formattedData = (0, getFormattedComments_js_1.default)(data, analysisId);
            const status = await (0, getActorStatus_js_1.default)(datasetId);
            if (status === "SUCCEEDED" || progress > 95)
                return formattedData;
        }
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.default = getPostComments;
