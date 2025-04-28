import express from "express";
import * as SegmentsController from "./controllers/SegmentsController";
import * as GlobalController from "./controllers/GlobalController";
import { PilotController } from "./controllers/PilotController";
import { getArtistProfileHandler } from "./controllers/ArtistProfileController";
import { generateImageHandler } from "./controllers/ImageGenerationController";
import { getCommentsHandler } from "./controllers/CommentsController";
import { getArtistSegmentsHandler } from "./controllers/ArtistSegmentsController";

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
routes.get("/account/socials", GlobalController.get_account_socials as any);
routes.get("/posts", GlobalController.get_posts as any);
routes.get("/fans", GlobalController.get_fans as any);

routes.get("/artist-profile", getArtistProfileHandler);

routes.get("/image-generation", generateImageHandler as any);

routes.get("/comments", getCommentsHandler as any);

routes.get("/artist/segments", getArtistSegmentsHandler as any);

export default routes;
