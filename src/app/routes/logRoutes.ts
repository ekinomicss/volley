import express from 'express';
import { createLog } from '../controllers/logController';
import { handleDeploy } from '../controllers/deployController';
const router = express.Router();


/* 
    Set Up API Route: create a new route in express server for submitting logs.
*/ 
router.post('/logs', createLog);
router.post('/deploy', handleDeploy);
router.post('/github-webhook', handleDeploy); // Add this line

export default router;
