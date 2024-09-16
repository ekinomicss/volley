require('dotenv').config();
import { storeLog } from '../src/app/services/logService';
import { getOldLogs, detectLogDifferences } from '../src/app/services/diffCheck';

test('should store log and detect differences from historical logs', async () => {
    // Step 1: Define the new log
    const newLog = { message: 'Test log', severity: 'error', timestamp: new Date() };
    
    // Step 2: Store the new log in Elasticsearch
    const result = await storeLog(newLog);
    expect(result).toBeDefined();
    
    // Step 3: Fetch historical logs
    const historicalLogs = await getOldLogs({ message: 'Test log' });

    // Step 4: Detect differences between the new log and historical logs
    const diffs = detectLogDifferences([newLog], historicalLogs);
    
    // Step 5: Assert that differences were detected (if applicable)
    if (historicalLogs.length > 0) {
        expect(diffs).toBeDefined();
        expect(diffs.length).toBeGreaterThan(0);
    } else {
        expect(diffs.length).toBe(0);
    }
});
