import express from 'express'
import * as SegmentsController from './controllers/SegmentsController';
import * as GlobalController from "./controllers/GlobalController"
import * as PilotController from "./controllers/PilotController"

const routes = express.Router();

routes.post('/get_full_report' , SegmentsController.get_full_report as any) ;
routes.post('/get_pitch_report' , SegmentsController.get_pitch_report as any) ;
routes.post('/get_next_steps' , SegmentsController.get_next_steps as any) ;
routes.post('/get_segments' , SegmentsController.get_segments as any) ;
routes.post('/get_segments_icons' , SegmentsController.get_segments_icons as any) ;

routes.get('/get_dataset_items', GlobalController.get_dataset_items as any);
routes.get('/get_dataset_status', GlobalController.get_dataset_status as any);

routes.get('/get_social_handles', GlobalController.get_social_handles as any);

routes.get('/autopilot/run' , PilotController.run_agent as any) ;
routes.get('/autopilot/status' , GlobalController.get_autopilot as any) ;

routes.get('/get_profile', GlobalController.get_profile as any);
routes.get('/get_fans_segments', GlobalController.get_fans_segments as any);
routes.get('/get_tiktok_profile', GlobalController.get_tiktok_profile as any);
routes.get('/get_twitter_profile', GlobalController.get_twitter_profile as any);

export default routes;