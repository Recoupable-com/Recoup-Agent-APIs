"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const saveCookies = async (scraper, cookies_path) => {
    try {
        const cookies = await scraper.getCookies();
        const cookiesString = cookies.map((cookie) => cookie.toString());
        await promises_1.default.mkdir(path_1.default.dirname(cookies_path), { recursive: true });
        await promises_1.default.writeFile(cookies_path, JSON.stringify(cookiesString));
    }
    catch (error) {
        return { error };
    }
};
exports.default = saveCookies;
