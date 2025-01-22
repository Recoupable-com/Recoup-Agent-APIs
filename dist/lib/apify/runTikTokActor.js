"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("../consts");
const runTikTokActor = async (input, actorId) => {
    try {
        const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${consts_1.APIFY_TOKEN}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
        const data = await response.json();
        const error = data?.error;
        const defaultDatasetId = data?.data?.defaultDatasetId;
        if (error?.message)
            return { error: error?.message };
        return defaultDatasetId;
    }
    catch (error) {
        console.error(error);
        return null;
    }
};
exports.default = runTikTokActor;
