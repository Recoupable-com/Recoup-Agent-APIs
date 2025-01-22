"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const consts_js_1 = require("./consts.js");
const getChatCompletions = async (messages, max_tokens = 1111) => {
    try {
        const openai = new openai_1.default();
        const response = await openai.chat.completions.create({
            model: consts_js_1.AI_MODEL,
            max_tokens,
            temperature: 0.7,
            messages,
        });
        const content = response.choices[0].message?.content?.toString();
        return content || "";
    }
    catch (error) {
        console.error(error);
        return "";
    }
};
exports.default = getChatCompletions;
