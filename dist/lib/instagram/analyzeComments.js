"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const saveFunnelComments_1 = __importDefault(require("../supabase/saveFunnelComments"));
const getPostComments_1 = __importDefault(require("./getPostComments"));
const getPostCommentsDatasetId_1 = __importDefault(require("./getPostCommentsDatasetId"));
const analyzeComments = async (chat_id, analysisId, latestPosts) => {
    const commentsDatasetId = await (0, getPostCommentsDatasetId_1.default)(latestPosts);
    const postComments = await (0, getPostComments_1.default)(commentsDatasetId, chat_id, analysisId);
    await (0, saveFunnelComments_1.default)(postComments);
    return postComments;
};
exports.default = analyzeComments;
