"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDataset_1 = __importDefault(require("../apify/getDataset"));
const funnels_1 = require("../funnels");
const step_1 = require("../step");
const errors_1 = require("../twitter/errors");
const getFormattedAccount_1 = __importDefault(require("./getFormattedAccount"));
const getProfile = async (datasetId, chat_id) => {
    try {
        while (1) {
            const datasetItems = await (0, getDataset_1.default)(datasetId);
            const errorMessage = datasetItems?.[0]?.error;
            if (errorMessage === errors_1.UNKNOWN_PROFILE_ERROR) {
                const error = {
                    error: errorMessage,
                    status: step_1.STEP_OF_ANALYSIS.UNKNOWN_PROFILE,
                    funnel_type: funnels_1.Funnel_Type.INSTAGRAM,
                };
                global.io.emit(`${chat_id}`, error);
                return { error };
            }
            if (errorMessage === errors_1.RATE_LIMIT_EXCEEDED) {
                const error = {
                    status: step_1.STEP_OF_ANALYSIS.RATE_LIMIT_EXCEEDED,
                    funnel_type: funnels_1.Funnel_Type.INSTAGRAM,
                    error: errorMessage,
                };
                global.io.emit(`${chat_id}`, error);
                return { error };
            }
            if (errorMessage)
                throw new Error(errorMessage);
            const formattedAccount = (0, getFormattedAccount_1.default)(datasetItems);
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
