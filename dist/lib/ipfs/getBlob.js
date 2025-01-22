"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const getBlob = async (imageUrl) => {
    try {
        const response = await axios_1.default.get(imageUrl, {
            responseType: "arraybuffer",
        });
        const type = response.headers["content-type"];
        const blob = new Blob([response.data], { type });
        return { blob, type };
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.default = getBlob;
