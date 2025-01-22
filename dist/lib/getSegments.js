"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getChatCompletions_js_1 = __importDefault(require("./getChatCompletions.js"));
const instructions_js_1 = require("./instructions.js");
const getSegments = async (context) => {
    try {
        const content = await (0, getChatCompletions_js_1.default)([
            {
                role: "user",
                content: `Context: ${JSON.stringify(context)}`,
            },
            {
                role: "system",
                content: `${instructions_js_1.instructions.get_fan_segments} \n Response should be in JSON format. {"data": [{ "string": number }, { "string": number }]}.`,
            },
        ]);
        if (content)
            return (JSON.parse(content
                ?.replace(/\n/g, "")
                ?.replace(/json/g, "")
                ?.replace(/```/g, ""))?.data || []);
        throw new Error("No content received from OpenAI");
    }
    catch (error) {
        throw new Error("API request failed");
    }
};
exports.default = getSegments;
