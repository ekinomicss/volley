import { Request, Response } from 'express';
import { storeLog } from '../services/logService';
import { getOldLogs } from '../services/diffCheck';
import { detectLogDifferences } from '../utils/diffUtil';
import { notifySlack } from '../services/slackService';  

export const createLog = async (req: Request, res: Response) => {
  try {
    const logData = req.body;

    // Fetch historical logs and detect differences
    const historicalLogs = await getOldLogs({ message: logData.message });
    const diffs = detectLogDifferences(logData, historicalLogs);

    // Store the new log in Elasticsearch
    const result = await storeLog(logData);

    // If there are differences (regressions), notify via Slack (or console for now)
    if (diffs.length > 0) {
      await notifySlack(logData, historicalLogs);  // Print regression info
    }

    res.status(201).json({ message: 'Log stored successfully', result, diffs });
  } catch (error) {
    console.error('Error storing log:', error);
    res.status(500).json({ message: 'Error storing log' });
  }
};
