import fs from 'fs';
import { storeLog } from '../services/logService'; 

const inferSeverity = (logLine: string): string => {
  if (logLine.toLowerCase().includes('error')) {
    return 'error';
  } else if (logLine.toLowerCase().includes('warn')) {
    return 'warning';
  } else if (logLine.toLowerCase().includes('fatal')) {
    return 'fatal';
  } else {
    return 'info'; 
  }
};

export const watchLogs = (logFilePath: string) => {
  const logStream = fs.createReadStream(logFilePath, { encoding: 'utf8', flags: 'r' });

  logStream.on('data', async (chunk) => {
    const logLine = chunk.toString('utf8');
    const severity = inferSeverity(logLine);

    const logData = {
      message: logLine,
      severity: severity, 
      timestamp: new Date().toISOString()
    };

    await storeLog(logData); 
  });

  logStream.on('error', (err) => {
    console.error('Error reading log file:', err);
  });
};
