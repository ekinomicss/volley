import fs from 'fs';
import { storeLog } from '../services/logService';  // Ensure the path to your logService is correct

export const watchLogs = (logFilePath: string) => {
  const logStream = fs.createReadStream(logFilePath, { encoding: 'utf8', flags: 'r' });

  logStream.on('data', async (logLine) => {
    // Call your log service to send this log to Elasticsearch
    const logData = {
      message: logLine,
      severity: 'info', // Customize severity based on your logic
      timestamp: new Date().toISOString()
    };
    await storeLog(logData);  // Using the existing `storeLog` function
  });

  logStream.on('error', (err) => {
    console.error('Error reading log file:', err);
  });
};
