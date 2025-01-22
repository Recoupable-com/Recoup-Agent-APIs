"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consts_js_1 = require("./consts.js");
const getChatCompletions_js_1 = __importDefault(require("./getChatCompletions.js"));
const instructions_js_1 = require("./instructions.js");
const getSegmentsWithIcons = async (segments, analysisId = null) => {
    try {
        const content = await (0, getChatCompletions_js_1.default)([
            {
                role: "user",
                content: `**Icon Names**: ${JSON.stringify(consts_js_1.ICONS)}\n
            **Segment Names**: ${JSON.stringify(segments)}`,
            },
            {
                role: "system",
                content: `${instructions_js_1.instructions.get_segments_icons} \n Response should be in JSON format. {"data": {"segment_name1": "icon_name1", "segment_name2": "icon_name2", ...}}`,
            },
        ]);
        if (content) {
            const reply = JSON.parse(content
                ?.replace(/\n/g, "")
                ?.replace(/json/g, "")
                ?.replace(/```/g, ""))?.data || [];
            const segmentsWithIcons = segments.map((segment) => {
                const iconName = reply[`${Object.keys(segment)[0]}`];
                const icon = consts_js_1.ICONS.find((name) => name.includes(iconName));
                return {
                    name: Object.keys(segment)[0],
                    icon: icon || "",
                    size: Object.values(segment)[0],
                    analysis_id: analysisId,
                };
            });
            return segmentsWithIcons;
        }
        throw new Error("No content received from OpenAI");
    }
    catch (error) {
        console.error(error);
        throw new Error("API request failed");
    }
};
exports.default = getSegmentsWithIcons;
