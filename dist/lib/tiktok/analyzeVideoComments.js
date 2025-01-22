"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const saveFunnelComments_js_1 = __importDefault(require("../supabase/saveFunnelComments.js"));
const getVideoComments_js_1 = __importDefault(require("./getVideoComments.js"));
const analyzeVideoComments = async (videoUrls, chat_id, analysisId) => {
    const videoComments = await (0, getVideoComments_js_1.default)(videoUrls, chat_id, analysisId);
    await (0, saveFunnelComments_js_1.default)(videoComments);
    return videoComments;
};
exports.default = analyzeVideoComments;
