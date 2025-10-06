import express from "express";
import * as SegmentsController from "./controllers/SegmentsController";
import * as GlobalController from "./controllers/GlobalController";
import { PilotController } from "./controllers/PilotController";
import { getArtistProfileHandler } from "./controllers/ArtistProfileController";
import { generateImageHandler } from "./controllers/ImageGenerationController";
import { getCommentsHandler } from "./controllers/CommentsController";
import { getArtistSegmentsHandler } from "./controllers/ArtistSegmentsController";
import { getSegmentFansHandler } from "./controllers/SegmentFansController";
import { getArtistSocialsHandler } from "./controllers/ArtistSocialsController";
import { getSocialPostsHandler } from "./controllers/SocialPostsController";
import { getPostCommentsHandler } from "./controllers/PostCommentsController";
import {
  getSpotifySearchHandler,
  getSpotifyAlbumHandler,
  getSpotifyTopTracksHandler,
  getSpotifyArtistAlbumsHandler,
} from "./controllers/SpotifyController";
import {
  searchTweetsHandler,
  getTrendsHandler,
} from "./controllers/TwitterController";
import {
  getInstagramProfilesHandler,
  getInstagramCommentsHandler,
} from "./controllers/InstagramController";
import { getScraperResultsHandler } from "./controllers/ApifyController";
import { getSubscriptionsHandler } from "./controllers/SubscriptionsController";
import {
  createCatalogsHandler,
  getCatalogsHandler,
  deleteCatalogsHandler,
} from "./controllers/CatalogsController";

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
routes.get("/apify/scraper", getScraperResultsHandler as any);

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
routes.get("/segment/fans", getSegmentFansHandler as any);
routes.get("/artist/socials", getArtistSocialsHandler as any);
routes.get("/social/posts", getSocialPostsHandler as any);
routes.get("/post/comments", getPostCommentsHandler as any);

routes.get("/spotify/search", getSpotifySearchHandler as any);
routes.get("/spotify/album", getSpotifyAlbumHandler as any);
routes.get("/spotify/artist/topTracks", getSpotifyTopTracksHandler as any);
routes.get("/spotify/artist/albums", getSpotifyArtistAlbumsHandler as any);

routes.get("/x/search", searchTweetsHandler as any);
routes.get("/x/trends", getTrendsHandler as any);
routes.get("/instagram/profiles", getInstagramProfilesHandler as any);
routes.get("/instagram/comments", getInstagramCommentsHandler as any);

routes.get("/subscriptions", getSubscriptionsHandler as any);

routes.get("/catalogs", getCatalogsHandler as any);
routes.post("/catalogs", createCatalogsHandler as any);
routes.delete("/catalogs", deleteCatalogsHandler as any);

export default routes;
