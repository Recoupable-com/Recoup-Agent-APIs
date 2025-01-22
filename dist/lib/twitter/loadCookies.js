"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const loadCookies = async (scraper, cookies_path) => {
    try {
        await promises_1.default.access(cookies_path);
        const cookiesData = await promises_1.default.readFile(cookies_path, "utf-8");
        const cookies = JSON.parse(cookiesData);
        await scraper.setCookies(cookies);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.default = loadCookies;
