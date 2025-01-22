"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_js_1 = __importDefault(require("./serverClient.js"));
const updateAnalysisStatus = async (chat_id, analysis_id, funnel_type, status, progress = 0, extra_data = null) => {
    if (!analysis_id || !chat_id)
        return;
    const { data } = await serverClient_js_1.default
        .from("funnel_analytics")
        .select("*")
        .eq("id", analysis_id)
        .single();
    const { data: newAnalysis } = await serverClient_js_1.default
        .from("funnel_analytics")
        .update({
        ...data,
        status,
    })
        .eq("id", analysis_id)
        .select("*")
        .single();
    global.io.emit(`${chat_id}`, { status, progress, extra_data, funnel_type });
    return newAnalysis;
};
exports.default = updateAnalysisStatus;
