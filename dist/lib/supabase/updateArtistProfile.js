"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverClient_js_1 = __importDefault(require("./serverClient.js"));
const updateArtistProfile = async (accountId, image, name, instruction, label, knowledges, existingArtistId = null) => {
    if (existingArtistId) {
        const { data: artistInfo, error } = await serverClient_js_1.default
            .from("artists")
            .update({
            image,
            name,
            instruction,
            knowledges,
            label,
            timestamp: Date.now(),
        })
            .eq("id", existingArtistId)
            .select("*")
            .single();
        if (error)
            console.error(error);
        return artistInfo.id;
    }
    const { data: artistInfo } = await serverClient_js_1.default
        .from("artists")
        .insert({
        image,
        name,
        instruction,
        knowledges,
        label,
        timestamp: Date.now(),
    })
        .select("*")
        .single();
    if (!accountId)
        return artistInfo.id;
    const { data: account } = await serverClient_js_1.default
        .from("accounts")
        .select("*")
        .eq("id", accountId);
    if (!account || !account.length)
        throw Error("Account does not exist.");
    await serverClient_js_1.default
        .from("accounts")
        .update({
        ...account[0],
        artistIds: [...account[0].artistIds, artistInfo.id],
    })
        .eq("id", account[0].id);
    return artistInfo.id;
};
exports.default = updateArtistProfile;
