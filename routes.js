import { Router } from 'express';
import * as SegmentsController from './controllers/SegmentsController.js';
import * as GlobalController from "./controllers/GlobalController.js"
import * as PilotController from "./controllers/PilotController.js"

const routes = new Router();

routes.post('/get_full_report' , SegmentsController.get_full_report) ;
routes.post('/get_pitch_report' , SegmentsController.get_pitch_report) ;
routes.post('/get_next_steps' , SegmentsController.get_next_steps) ;
routes.post('/get_segments' , SegmentsController.get_segments) ;
routes.post('/get_segments_icons' , SegmentsController.get_segments_icons) ;

routes.get('/get_dataset_items', GlobalController.get_dataset_items);
routes.get('/get_dataset_status', GlobalController.get_dataset_status);

routes.get('/get_social_handles', GlobalController.get_social_handles);

routes.get('/autopilot' , PilotController.run_agent) ;
routes.get('/autopilot/status' , GlobalController.get_autopilot) ;

export default routes;