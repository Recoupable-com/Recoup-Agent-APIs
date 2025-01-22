"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("../consts");
const getStackClient_1 = __importDefault(require("./getStackClient"));
const trackFunnelAnalysisChat = async (address, username, artistId, chatId, funnelName) => {
    try {
        const stackClient = (0, getStackClient_1.default)(consts_1.CHAT_POINT_SYSTEM_ID);
        const uniqueId = `${address}-${Date.now()}`;
        const eventName = `${consts_1.MESSAGE_SENT_EVENT}-${chatId}`;
        await stackClient.track(eventName, {
            points: consts_1.MESSAGE_SENT_POINT,
            account: address || "",
            uniqueId,
            metadata: {
                conversationId: chatId,
                artistId,
                title: `${funnelName} Analysis: ${username}`,
                is_funnel_analysis: true,
                funnel_name: funnelName,
            },
        });
    }
    catch (error) {
        console.error(error);
        return { error };
    }
};
exports.default = trackFunnelAnalysisChat;
