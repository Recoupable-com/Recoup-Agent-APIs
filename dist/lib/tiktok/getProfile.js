"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDataset_js_1 = __importDefault(require("../apify/getDataset.js"));
const funnels_js_1 = require("../funnels.js");
const step_js_1 = require("../step.js");
const errors_js_1 = require("../twitter/errors.js");
const getFormattedAccount_js_1 = __importDefault(require("./getFormattedAccount.js"));
const getProfile = async (datasetId, chat_id = null) => {
    try {
        while (1) {
            const datasetItems = await (0, getDataset_js_1.default)(datasetId);
            const errorMessage = datasetItems?.[0]?.error;
            if (errorMessage === errors_js_1.UNKNOWN_PROFILE_ERROR) {
                const error = {
                    status: step_js_1.STEP_OF_ANALYSIS.UNKNOWN_PROFILE,
                    funnel_type: funnels_js_1.Funnel_Type.INSTAGRAM,
                    error: errorMessage,
                };
                global.io.emit(`${chat_id}`, error);
                return { error };
            }
            if (errorMessage)
                throw new Error(errorMessage);
            const formattedAccount = (0, getFormattedAccount_js_1.default)(datasetItems);
            if (formattedAccount)
                return formattedAccount;
        }
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
exports.default = getProfile;
