"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getBlob_js_1 = __importDefault(require("./getBlob.js"));
const ipfs_js_1 = require("./ipfs.js");
const uploadPfpToIpfs = async (image) => {
    if (!image)
        return "";
    const { blob, type } = await (0, getBlob_js_1.default)(image);
    const avatarBlob = new Blob([blob], { type });
    const fileName = "avatar.png";
    const avatarFile = new File([avatarBlob], fileName, { type });
    const avatarCid = await (0, ipfs_js_1.uploadToIpfs)(avatarFile);
    return `https://ipfs.decentralized-content.com/ipfs/${avatarCid}`;
};
exports.default = uploadPfpToIpfs;
