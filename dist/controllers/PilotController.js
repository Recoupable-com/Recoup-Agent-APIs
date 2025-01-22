"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_agent = void 0;
const getInstagramAnalysis_1 = __importDefault(require("../agents/getInstagramAnalysis"));
const getSpotifyAnalysis_1 = __importDefault(require("../agents/getSpotifyAnalysis"));
const getTikTokAnalysis_1 = __importDefault(require("../agents/getTikTokAnalysis"));
const getTwitterAnalysis_1 = __importDefault(require("../agents/getTwitterAnalysis"));
const funnels_1 = require("../lib/funnels");
const uuid_1 = require("uuid");
const run_agent = async (req, res) => {
    try {
        const { handle, type } = req.query;
        const agent_type = Object.values(funnels_1.Funnel_Type).find((value) => value === type);
        if (!agent_type)
            return res.status(500).json({ message: "Agent type is invalid." });
        const pilotId = (0, uuid_1.v4)();
        res.status(200).json({ pilotId });
        const isWrapped = type === funnels_1.Funnel_Type.WRAPPED;
        if (isWrapped || type === funnels_1.Funnel_Type.INSTAGRAM)
            (0, getInstagramAnalysis_1.default)(handle, pilotId, null, null, isWrapped);
        if (isWrapped || type === funnels_1.Funnel_Type.TWITTER)
            (0, getTwitterAnalysis_1.default)(handle, pilotId, null, null, isWrapped);
        if (isWrapped || type === funnels_1.Funnel_Type.TIKTOK)
            (0, getTikTokAnalysis_1.default)(handle, pilotId, null, null, isWrapped);
        if (isWrapped || type === funnels_1.Funnel_Type.SPOTIFY)
            (0, getSpotifyAnalysis_1.default)(handle, pilotId, null, null, isWrapped);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};
exports.run_agent = run_agent;
