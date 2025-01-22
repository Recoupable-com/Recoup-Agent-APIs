"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runTikTokActor_js_1 = __importDefault(require("../apify/runTikTokActor.js"));
const errors_js_1 = require("../twitter/errors.js");
const getProfileDatasetId = async (handle) => {
    const profiles = [handle];
    const input = {
        resultsPerPage: 10,
        proxyCountryCode: "None",
        profiles,
    };
    try {
        const response = await (0, runTikTokActor_js_1.default)(input, "clockworks~tiktok-scraper");
        const error = response?.error;
        if (error)
            throw new Error(errors_js_1.OUTSTANDING_ERROR);
        return response;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
exports.default = getProfileDatasetId;
