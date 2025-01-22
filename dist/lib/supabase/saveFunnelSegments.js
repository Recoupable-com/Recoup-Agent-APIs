"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_1 = __importDefault(require("./serverClient"));
const saveFunnelSegments = async (segments) => {
    const { data } = await serverClient_1.default
        .from("funnel_analytics_segments")
        .insert(segments)
        .select("*");
    return data;
};
exports.default = saveFunnelSegments;
