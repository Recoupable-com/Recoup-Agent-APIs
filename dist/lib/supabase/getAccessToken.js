"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAccessTokenByRefreshToken_1 = __importDefault(require("./getAccessTokenByRefreshToken"));
const getAdminPresave_1 = __importDefault(require("./getAdminPresave"));
const serverClient_1 = __importDefault(require("./serverClient"));
const getAccessToken = async () => {
    try {
        const presave = await (0, getAdminPresave_1.default)();
        if (presave?.error)
            return { error: presave?.error };
        const refreshToken = presave.refreshToken;
        const tokens = await (0, getAccessTokenByRefreshToken_1.default)(refreshToken);
        if (tokens?.error)
            return { error: tokens?.error };
        const { error } = await serverClient_1.default
            .from("presave")
            .update({
            ...presave,
            accessToken: tokens?.accessToken,
            refreshToken: tokens?.refreshToken,
        })
            .eq("id", "admin")
            .select("*")
            .single();
        if (error)
            return { error };
        return tokens.accessToken;
    }
    catch (error) {
        return { error };
    }
};
exports.default = getAccessToken;
