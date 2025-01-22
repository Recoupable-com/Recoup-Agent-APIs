"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const consts_1 = require("../consts");
dotenv_1.default.config();
const getActorStatus = async (datasetId) => {
    try {
        const response = await fetch(`https://api.apify.com/v2/actor-runs?token=${consts_1.APIFY_TOKEN}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        const actorStatus = data.data.items.find((item) => item.defaultDatasetId === datasetId);
        return actorStatus.status;
    }
    catch (error) {
        return "RUNNING";
    }
};
exports.default = getActorStatus;
