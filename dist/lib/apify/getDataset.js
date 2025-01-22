"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("../consts");
const getDataset = async (datasetId) => {
    const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${consts_1.APIFY_TOKEN}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
};
exports.default = getDataset;
