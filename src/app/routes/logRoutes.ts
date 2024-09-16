import express from 'express';
import { createLog } from '../controllers/logController';
const router = express.Router();


/* 
    Set Up API Route: create a new route in express server for submitting logs.
*/ 
router.post('/logs', createLog);

export default router;
