import { Request, Response } from 'express';
import { storeLog } from '../services/logService';
import { getOldLogs, analyzeLogHistory } from '../services/diffCheck';
import { notifySlack } from '../services/slackService';  

export const createLog = async (req: Request, res: Response) => {
  try {
    const logData = req.body;

    // Fetch historical logs and detect differences
    const historicalLogs = await getOldLogs({ message: logData.message });
    const analyzedHistory = await analyzeLogHistory(logData, historicalLogs);

    // Store the new log in Elasticsearch
    const result = await storeLog(logData);

    // If there are differences (regressions), notify via Slack (or console for now)
    if (analyzedHistory.length > 0) {
      await notifySlack(logData, [analyzedHistory]);  
    }

    res.status(201).json({ message: 'Log stored successfully', result, analyzedHistory });
  } catch (error) {
    console.error('Error storing log:', error);
    res.status(500).json({ message: 'Error storing log' });
  }
};
