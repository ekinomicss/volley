require('dotenv').config();
import { fetchAndStoreLogs } from '../src/app/services/githubActionsService';
import { getOldLogs, analyzeLogHistory } from '../src/app/services/diffCheck';
import { notifySlack } from '../src/app/services/slackService';
import { Log } from '../src/app/types/Log';

jest.mock('../src/app/services/deploymentService', () => ({
  getDeploymentInfo: jest.fn().mockResolvedValue({
    deployId: 'test-deploy-123',
    deployDetails: 'Test deployment'
  })
}));

test('should fetch GitHub Actions logs, detect differences, and notify Slack', async () => {
    // Step 1: Fetch and store logs from GitHub Actions
    const fetchedLogs: Log[] = await fetchAndStoreLogs() as Log[];
    expect(fetchedLogs.length).toBeGreaterThan(0);
    
    // Step 2: Fetch stored logs from Elasticsearch
    const storedLogs = await getOldLogs({ message: 'log' });
    expect(storedLogs.length).toBeGreaterThan(0);
    
    // Step 3: Get the most recent 10 logs and find any error logs
    const recentLogs = fetchedLogs.slice(0, 400);
    const errorLogs = recentLogs.filter(log => log.severity === 'error');
    
    // Step 4: Detect differences
    const analyzedLogHistory = await analyzeLogHistory(errorLogs, storedLogs);

    // Step 5: Notify Slack
    const consoleLogSpy = jest.spyOn(console, 'log');
    const consoleErrorSpy = jest.spyOn(console, 'error');

    const slackResponse = await notifySlack(errorLogs, [analyzedLogHistory]);

    // Step 6: Assert Slack notification result
    if (errorLogs.length > 0) {
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('error logs'));
    } else {
        expect(consoleLogSpy).toHaveBeenCalledWith('No error logs found. Skipping Slack notification.');
    }
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Clean up spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
}, 60000); // Increase timeout to allow for API calls and log processing

