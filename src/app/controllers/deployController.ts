import { Request, Response } from 'express';
import { fetchAndStoreLogs } from '../services/githubActionsService';
import { notifySlack } from '../services/slackService';
import { getOldLogs, analyzeLogHistory } from '../services/diffCheck';
import { Log } from '../types/Log';

export const handleDeploy = async (req: Request, res: Response) => {
  try {
    const { deployId, deployDetails } = req.body;

    // Step 1: Fetch and store logs
    const fetchedLogs: Log[] = await fetchAndStoreLogs();

    // Step 2: Fetch stored logs
    const storedLogs = await getOldLogs({ deployId });

    // Step 3: Get recent logs and find error logs
    const recentLogs = fetchedLogs.slice(0, 400);
    const errorLogs = recentLogs.filter(log => log.severity === 'error');

    // Get most recent timestamp
    const mostRecentTimestamp = recentLogs.reduce((max, log) => 
      new Date(log.timestamp) > new Date(max) ? log.timestamp : max, 
      recentLogs[0]?.timestamp || ''
    );

    const mostRecentDeployTimestamp = new Date(mostRecentTimestamp);
    mostRecentDeployTimestamp.setSeconds(0, 0);

    const recentErrorLogs = errorLogs.filter(log => 
      new Date(log.timestamp) > mostRecentDeployTimestamp
    );

    // Step 4: Analyze log history
    const analysis = await analyzeLogHistory(errorLogs, storedLogs);

    // Step 5: Notify Slack
    await notifySlack(recentErrorLogs, [analysis, `Deploy ID: ${deployId}`, `Details: ${deployDetails}`]);

    res.status(200).json({ message: 'Deploy handled successfully' });
  } catch (error) {
    console.error('Error handling deploy:', error);
    res.status(500).json({ message: 'Error handling deploy' });
  }
};