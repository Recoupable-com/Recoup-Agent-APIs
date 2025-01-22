"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runTikTokActor_js_1 = __importDefault(require("../apify/runTikTokActor.js"));
const getVideoCommentsDatasetId = async (postURLs) => {
    const input = {
        postURLs,
        commentsPerPost: 100,
        maxRepliesPerComment: 0,
    };
    try {
        const defaultDatasetId = await (0, runTikTokActor_js_1.default)(input, "clockworks~tiktok-comments-scraper");
        return defaultDatasetId;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
exports.default = getVideoCommentsDatasetId;
