import express, { Request, Response, RequestHandler } from "express";
import * as SegmentsController from "./controllers/SegmentsController";
import * as GlobalController from "./controllers/GlobalController";
import { PilotController } from "./controllers/PilotController";
import { getAccountSocials } from "./lib/supabase/getAccountSocials";

const routes = express.Router();
const pilotController = new PilotController();

routes.post("/create_report", SegmentsController.create_report as any);
routes.post("/get_pitch_report", SegmentsController.get_pitch_report as any);
routes.post("/get_next_steps", SegmentsController.get_next_steps as any);
routes.post(
  "/get_segments_icons",
  SegmentsController.get_segments_icons as any
);
routes.post("/generate_segments", SegmentsController.generate_segments as any);

routes.get("/get_dataset_items", GlobalController.get_dataset_items as any);
routes.get("/get_dataset_status", GlobalController.get_dataset_status as any);

routes.get("/get_social_handles", GlobalController.get_social_handles as any);

routes.post("/agentkit/run", pilotController.run_agent as any);
routes.get("/agentkit", GlobalController.get_agent as any);

routes.get("/get_profile", GlobalController.get_profile as any);
routes.post("/get_fans_segments", GlobalController.get_fans_segments as any);
routes.post(
  "/connect_fans_segments_to_artist",
  GlobalController.connect_fans_segments_to_artist as any
);
routes.get("/get_tiktok_profile", GlobalController.get_tiktok_profile as any);
routes.get("/get_twitter_profile", GlobalController.get_twitter_profile as any);
routes.post("/get_segments", GlobalController.get_segments as any);

// TODO: Fix TypeScript typing for express request handlers
// Current implementation works but has linter errors due to return type mismatch
// Potential solutions:
// 1. Create custom type that extends RequestHandler
// 2. Use express-async-handler
// 3. Update tsconfig.json to be less strict with express types

// Account socials endpoint
const getAccountSocialsHandler: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { accountId } = req.query;

    if (!accountId || typeof accountId !== "string") {
      res.status(400).json({
        status: "error",
        message: "accountId is required and must be a string",
      });
      return;
    }

    const result = await getAccountSocials(accountId);
    res.json(result);
    return;
  } catch (error) {
    console.error("[ERROR] Error in /account/socials:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
    return;
  }
};

routes.get("/account/socials", getAccountSocialsHandler);

export default routes;
