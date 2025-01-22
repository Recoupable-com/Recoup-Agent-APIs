"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_1 = __importDefault(require("./serverClient"));
const saveFunnelComments = async (comments) => {
    const { data } = await serverClient_1.default
        .from("funnel_analytics_comments")
        .insert(comments)
        .select("*");
    return data;
};
exports.default = saveFunnelComments;
