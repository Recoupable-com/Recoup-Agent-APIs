"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const step_1 = require("../step");
const serverClient_1 = __importDefault(require("./serverClient"));
const beginAnalysis = async (chat_id, handle, funnel_type = null) => {
    const { data } = await serverClient_1.default
        .from("funnel_analytics")
        .insert({
        chat_id,
        handle,
        status: step_1.STEP_OF_ANALYSIS.INITIAL,
        type: funnel_type ? funnel_type.toUpperCase() : funnel_type,
    })
        .select("*")
        .single();
    return data;
};
exports.default = beginAnalysis;
