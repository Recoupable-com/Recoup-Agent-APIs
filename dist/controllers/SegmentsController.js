"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_segments_icons = exports.get_segments = exports.get_next_steps = exports.get_pitch_report = exports.get_full_report = void 0;
const instructions_1 = require("../lib/instructions");
const consts_1 = require("../lib/consts");
const getChatCompletions_1 = __importDefault(require("../lib/getChatCompletions"));
const sendReportEmail_1 = __importDefault(require("../lib/email/sendReportEmail"));
const get_full_report = async (req, res) => {
    try {
        const data = req.body;
        const content = await (0, getChatCompletions_1.default)([
            {
                role: "user",
                content: `
        Context: ${JSON.stringify(data)}
        Question: Please, create a fan segment report.`,
            },
            {
                role: "system",
                content: `${instructions_1.instructions.get_segements_report}
        ${consts_1.HTML_RESPONSE_FORMAT_INSTRUCTIONS}
        NOTE: ${consts_1.FULL_REPORT_NOTE}`,
            },
        ], 2222);
        (0, sendReportEmail_1.default)(content, data?.artistImage, data?.artistName, data?.email || "", `${data?.segment_name} Report`);
        if (content)
            return res.status(200).json({ content });
        return res.status(500).json({ error: "No content received from OpenAI" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "API request failed" });
    }
};
exports.get_full_report = get_full_report;
const get_pitch_report = async (req, res) => {
    try {
        const data = req.body;
        const content = await (0, getChatCompletions_1.default)([
            {
                role: "user",
                content: `
        Context: ${JSON.stringify(data)}
        Question: Please create a pitch HTML report if the pitch name is ${data?.pitch_name}.`,
            },
            {
                role: "system",
                content: `${instructions_1.instructions.get_pitch_report}
        ${consts_1.HTML_RESPONSE_FORMAT_INSTRUCTIONS}
        NOTE: ${consts_1.FULL_REPORT_NOTE}`,
            },
        ], 2222);
        (0, sendReportEmail_1.default)(content, data?.artistImage, data?.artistName, data?.email || "", `${data?.segment_name} Report`);
        if (content)
            return res.status(200).json({ content });
        return res.status(500).json({ error: "No content received from OpenAI" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "API request failed" });
    }
};
exports.get_pitch_report = get_pitch_report;
const get_next_steps = async (req, res) => {
    try {
        const body = req.body;
        const content = await (0, getChatCompletions_1.default)([
            {
                role: "user",
                content: `Context: ${JSON.stringify(body)}`,
            },
            {
                role: "system",
                content: `${instructions_1.instructions.get_segments_report_next_step}
          ${consts_1.HTML_RESPONSE_FORMAT_INSTRUCTIONS}
          NOTE: ${consts_1.REPORT_NEXT_STEP_NOTE}`,
            },
        ]);
        if (content)
            return res.status(200).json({ data: content });
        return res.status(500).json({ error: "No content received from OpenAI" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "API request failed" });
    }
};
exports.get_next_steps = get_next_steps;
const get_segments = async (req, res) => {
    try {
        const body = req.body;
        const content = await (0, getChatCompletions_1.default)([
            {
                role: "user",
                content: `Context: ${JSON.stringify(body)}`,
            },
            {
                role: "system",
                content: `${instructions_1.instructions.get_fan_segments} \n Response should be in JSON format. {"data": [{ "string": number }, { "string": number }]}.`,
            },
        ]);
        if (content)
            return res.status(200).json({
                data: JSON.parse(content
                    ?.replace(/\n/g, "")
                    ?.replace(/json/g, "")
                    ?.replace(/```/g, ""))?.data || [],
            });
        return res.status(500).json({ error: "No content received from OpenAI" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "API request failed" });
    }
};
exports.get_segments = get_segments;
const get_segments_icons = async (req, res) => {
    try {
        const body = req.body;
        const content = await (0, getChatCompletions_1.default)([
            {
                role: "user",
                content: `**Icon Names**: ${JSON.stringify(consts_1.ICONS)}\n
        **Segment Names**: ${JSON.stringify(body)}`,
            },
            {
                role: "system",
                content: `${instructions_1.instructions.get_segments_icons} \n Response should be in JSON format. {"data": {"segment_name1": "icon_name1", "segment_name2": "icon_name2", ...}}`,
            },
        ]);
        if (content)
            return res.status(200).json({
                data: JSON.parse(content
                    ?.replace(/\n/g, "")
                    ?.replace(/json/g, "")
                    ?.replace(/```/g, ""))?.data || [],
            });
        return res.status(500).json({ error: "No content received from OpenAI" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "API request failed" });
    }
};
exports.get_segments_icons = get_segments_icons;
