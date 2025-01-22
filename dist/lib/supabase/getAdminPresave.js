"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_1 = __importDefault(require("./serverClient"));
const getAdminPresave = async () => {
    const { data, error } = await serverClient_1.default
        .from("presave")
        .select()
        .eq("id", "admin")
        .single();
    if (error)
        return { error };
    return data;
};
exports.default = getAdminPresave;
