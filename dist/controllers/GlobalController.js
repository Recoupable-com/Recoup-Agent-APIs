"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_autopilot = exports.get_social_handles = exports.get_dataset_items = exports.get_dataset_status = exports.get_tiktok_profile = void 0;
const getActorStatus_1 = __importDefault(require("../lib/apify/getActorStatus"));
const getDataset_1 = __importDefault(require("../lib/apify/getDataset"));
const serverClient_1 = __importDefault(require("../lib/supabase/serverClient"));
const getSocialHandles_1 = __importDefault(require("../lib/getSocialHandles"));
const stagehand_1 = require("@browserbasehq/stagehand");
const zod_1 = require("zod");
const stagehand = new stagehand_1.Stagehand({
    env: "LOCAL",
    verbose: 1,
    debugDom: true,
    enableCaching: false,
});
const get_tiktok_profile = async (req, res) => {
    const { handle } = req.query;
    try {
        stagehand.init({ modelName: "gpt-4o-mini" });
        await stagehand.page.goto(`https://tiktok.com/@${handle}`);
        const data = await stagehand.page.extract({
            instruction: "extract the bio of the page",
            schema: zod_1.z.object({
                bio: zod_1.z.string(),
            }),
        });
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};
exports.get_tiktok_profile = get_tiktok_profile;
const get_dataset_status = async (req, res) => {
    const { datasetId } = req.query;
    try {
        const data = await (0, getActorStatus_1.default)(datasetId);
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};
exports.get_dataset_status = get_dataset_status;
const get_dataset_items = async (req, res) => {
    const { datasetId } = req.query;
    try {
        const data = await (0, getDataset_1.default)(datasetId);
        if (data?.[0]?.error)
            return res.status(500).json({ error: data?.[0]?.error });
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};
exports.get_dataset_items = get_dataset_items;
const get_social_handles = async (req, res) => {
    const { handle } = req.query;
    try {
        const handles = await (0, getSocialHandles_1.default)(handle);
        return res.status(200).json({
            data: handles,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};
exports.get_social_handles = get_social_handles;
const get_autopilot = async (req, res) => {
    const { pilotId } = req.query;
    try {
        const { data } = await serverClient_1.default
            .from("funnel_analytics")
            .select(`*,
      funnel_analytics_segments (
        *
      ),
      funnel_analytics_profile (
        *,
        artists (
          *,
          artist_social_links (
            *
          )
        )
      )`)
            .eq("chat_id", pilotId);
        return res.status(200).json({ data });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};
exports.get_autopilot = get_autopilot;
