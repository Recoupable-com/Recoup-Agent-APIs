"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_1 = __importDefault(require("./serverClient"));
const saveFunnelProfile = async (profile) => {
    const { data } = await serverClient_1.default
        .from("funnel_analytics_profile")
        .insert(profile)
        .select("*")
        .single();
    return data;
};
exports.default = saveFunnelProfile;
