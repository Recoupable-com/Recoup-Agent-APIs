"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runTikTokActor_1 = __importDefault(require("../apify/runTikTokActor"));
const getPostCommentsDatasetId = async (directUrls) => {
    const input = {
        directUrls,
        resultsLimit: 100,
    };
    try {
        const defaultDatasetId = await (0, runTikTokActor_1.default)(input, "apify~instagram-comment-scraper");
        return defaultDatasetId;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
exports.default = getPostCommentsDatasetId;
