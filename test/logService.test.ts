require('dotenv').config();
import { storeLog } from '../src/app/services/logService';
import { getOldLogs, detectLogDifferences } from '../src/app/services/diffCheck';
import { notifySlack } from '../src/app/services/slackService';
import { Log } from '../src/app/types/Log';

jest.mock('../src/app/services/deploymentService', () => ({
  getDeploymentInfo: jest.fn().mockResolvedValue({
    deployId: 'test-deploy-123',
    deployDetails: 'Test deployment'
  })
}));

test('should store log, detect differences, and notify Slack', async () => {
    // Step 1: Store an initial log
    const initialLog: Log = { message: 'Initial log', severity: 'notice', timestamp: new Date(2023, 0, 1) };
    await storeLog(initialLog);
    
    // Step 2: Define the new log with a different message
    const newLog: Log = { message: 'New test log', severity: 'error', timestamp: new Date() };
    
    // Step 3: Store the new log in Elasticsearch
    const result = await storeLog(newLog);
    expect(result).toBeDefined();
    
    // Step 4: Fetch historical logs
    const historicalLogs = await getOldLogs({ message: 'log' });

    // Step 5: Detect differences
    const differences = detectLogDifferences([newLog], historicalLogs);

    // Step 6: Notify Slack
    const consoleLogSpy = jest.spyOn(console, 'log');
    const consoleErrorSpy = jest.spyOn(console, 'error');

    // Update this line to pass both newLog and historicalLogs
    await notifySlack([newLog], historicalLogs);

    // Step 7: Assert Slack notification result
    expect(consoleLogSpy).toHaveBeenCalledWith('Slack notification sent.');
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Clean up spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
}, 30000); // Increase timeout to allow for API call
