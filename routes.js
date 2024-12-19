import { Router } from 'express';
import * as TikTokTrendsController from './controllers/TikTokTrendsController.js';
import * as TikTokCommentsController from './controllers/TikTokCommentsController.js';
import * as SegmentsController from './controllers/SegmentsController.js';
import * as TwitterController from "./controllers/TwitterController.js"
import * as SpotifyController from "./controllers/SpotifyController.js"

const routes = new Router();

routes.get('/get_tiktok_account_trends' , TikTokTrendsController.get_tiktok_account_trends) ;
routes.get('/get_tiktok_account_trends/get_dataset_items' , TikTokTrendsController.get_dataset_items) ;
routes.get('/get_tiktok_account_trends/get_dataset_status' , TikTokTrendsController.get_dataset_status) ;

routes.get('/get_tiktok_video_comments' , TikTokCommentsController.get_tiktok_video_comments) ;
routes.get('/get_tiktok_video_comments/get_dataset_items' , TikTokCommentsController.get_dataset_items) ;
routes.get('/get_tiktok_video_comments/get_dataset_status' , TikTokCommentsController.get_dataset_status) ;

routes.post('/get_full_report' , SegmentsController.get_full_report) ;
routes.post('/get_next_steps' , SegmentsController.get_next_steps) ;
routes.post('/get_segments' , SegmentsController.get_segments) ;
routes.post('/get_segments_icons' , SegmentsController.get_segments_icons) ;

routes.get('/get_twitter_profile' , TwitterController.getProfile) ;
routes.get('/get_tweets' , TwitterController.getAllTweets) ;

routes.get('/get_spotify_profile' , SpotifyController.getProfile) ;
routes.get('/get_artist_albums' , SpotifyController.getArtistAlbums) ;
routes.get('/get_artist_tracks' , SpotifyController.getArtistTracks) ;


export default routes;