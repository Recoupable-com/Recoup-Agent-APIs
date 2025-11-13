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
  getSpotifyArtistHandler,
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
import {
  createSongsHandler,
  getSongsHandler,
} from "./controllers/SongsController";
import {
  createCatalogSongsHandler,
  getCatalogSongsHandler,
  deleteCatalogSongsHandler,
} from "./controllers/CatalogSongsController";
import {
  getTasksHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from "./controllers/TasksController";
import { getChatsHandler } from "./controllers/ChatsController";
import { postSocialScrapeHandler } from "./controllers/SocialController";
import handleApifyWebhook from "./lib/apify/webhooks/handleApifyWebhook";

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
routes.post("/apify/webhooks/socials", handleApifyWebhook);
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
routes.post("/social/scrape", postSocialScrapeHandler as any);
routes.get("/post/comments", getPostCommentsHandler as any);

routes.get("/spotify/search", getSpotifySearchHandler as any);
routes.get("/spotify/album", getSpotifyAlbumHandler as any);
routes.get("/spotify/artist", getSpotifyArtistHandler as any);
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

routes.get("/songs", getSongsHandler as any);
routes.post("/songs", createSongsHandler as any);

routes.get("/catalogs/songs", getCatalogSongsHandler as any);
routes.post("/catalogs/songs", createCatalogSongsHandler as any);
routes.delete("/catalogs/songs", deleteCatalogSongsHandler as any);

routes.get("/tasks", getTasksHandler as any);
routes.post("/tasks", createTaskHandler as any);
routes.patch("/tasks", updateTaskHandler as any);
routes.delete("/tasks", deleteTaskHandler as any);

routes.get("/chats", getChatsHandler as any);

export default routes;
