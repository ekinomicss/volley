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
    const initialLog: Log = { message: 'Initial log', severity: 'notice',timestamp: new Date(2023, 0, 1) };
    await storeLog(initialLog);
    
    // Step 2: Define the new log with a different message
    const newLog: Log = { message: 'New test log', severity: 'error',timestamp: new Date() };
    
    // Step 3: Store the new log in Elasticsearch
    const result = await storeLog(newLog);
    expect(result).toBeDefined();
    
    // Step 4: Fetch historical logs
    const historicalLogs = await getOldLogs({ message: 'log' });

    console.log('Historical logs:', historicalLogs);

    // Step 5: Detect differences and notify Slack
    const consoleSpy = jest.spyOn(console, 'log');
    await notifySlack([newLog], historicalLogs);

    // Step 6: Assert that differences were detected and Slack was notified
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Regression detected!'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('test-deploy-123'));

    consoleSpy.mockRestore();
});
