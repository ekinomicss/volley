require('dotenv').config();
import { fetchAndStoreLogs } from '../src/app/services/githubActionsService';
import { getOldLogs, detectLogDifferences } from '../src/app/services/diffCheck';
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
    
    // Step 3: Use the first fetched log as the new log
    const newLog = fetchedLogs[0];
    
    // Step 4: Detect differences
    const differences = detectLogDifferences([newLog], storedLogs);

    // Step 5: Notify Slack
    const consoleLogSpy = jest.spyOn(console, 'log');
    const consoleErrorSpy = jest.spyOn(console, 'error');

    await notifySlack([newLog], storedLogs);

    // Step 6: Assert Slack notification result
    expect(consoleLogSpy).toHaveBeenCalledWith('Slack notification sent.');
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Additional check to ensure logs are included in the notification
    // expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(expectedLogMessage));

    // Clean up spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
}, 60000); // Increase timeout to allow for API calls and log processing
