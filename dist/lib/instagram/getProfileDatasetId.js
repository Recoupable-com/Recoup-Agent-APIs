"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runTikTokActor_1 = __importDefault(require("../apify/runTikTokActor"));
const errors_1 = require("../twitter/errors");
const getProfileDatasetId = async (handle) => {
    const input = {
        usernames: [handle],
    };
    try {
        const response = await (0, runTikTokActor_1.default)(input, "apify~instagram-profile-scraper");
        const error = response?.error;
        if (error)
            throw new Error(errors_1.OUTSTANDING_ERROR);
        return response;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
exports.default = getProfileDatasetId;
