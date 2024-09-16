import { Request, Response } from 'express';
import { storeLog } from '../services/logService';
import { getHistoricalLogs } from '../services/diffCheck';
import { detectLogDifferences } from '../utils/diffUtil';

export const createLog = async (req: Request, res: Response) => {
  try {
    const logData = req.body;

    // Fetch historical logs and detect differences
    const historicalLogs = await getHistoricalLogs({ message: logData.message });
    const diffs = detectLogDifferences(logData, historicalLogs);

    // Store the new log in Elasticsearch
    const result = await storeLog(logData);

    res.status(201).json({ message: 'Log stored successfully', result, diffs });
  } catch (error) {
    console.error('Error storing log:', error);
    res.status(500).json({ message: 'Error storing log' });
  }
};
