require('dotenv').config();
import { storeLog } from '../src/app/services/logService';

test('should store log in Elasticsearch', async () => {
    const mockLog = { message: 'Test log' };
    const result = await storeLog(mockLog);
    expect(result).toBeDefined();
});
