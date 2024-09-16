import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import dotenv from 'dotenv';
import { storeLog } from './logService';
import { Log } from '../types/Log';
import { exec } from 'child_process';

dotenv.config();

const repoOwner = 'ekinomicss';
const repoName = 'volley_toy_dropdown';
const runId = '10889816859';
const token = process.env.GITHUB_TOKEN;

const url = `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs/${runId}/logs`;

// Function to parse a log line and create a Log object
const parseLogLine = (line: string): Log => {
    const timestampMatch = line.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    const timestamp = timestampMatch ? new Date(timestampMatch[0]) : new Date();
      const severity = /error|err|fail|warn/i.test(line) ? 'error' : 'info';
  
    return {
      timestamp,
      message: line,
      severity
    };
  };

// Function to process the downloaded log file
const processLogFile = async (filePath: string): Promise<Log[]> => {
  const logs: Log[] = [];
  const fileStream = createReadStream(filePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const logEntry = parseLogLine(line);
    await storeLog(logEntry);
    logs.push(logEntry);
  }
  return logs;
};

// Function to download and process the logs from GitHub
export const fetchAndStoreLogs = async (): Promise<Log[]> => {
  const processedLogs: Log[] = [];

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'log-fetcher'
      }
    });

    const logFilePath = path.join(__dirname, 'logs.zip');
    const extractPath = path.join(__dirname, 'logs');

    // Create the extraction directory if it doesn't exist
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    const writeStream = fs.createWriteStream(logFilePath);

    await new Promise((resolve, reject) => {
      response.data.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    console.log('Logs downloaded successfully');

    // Unzip the logs
    const unzipCommand = `unzip -o ${logFilePath} -d ${path.join(__dirname, 'logs')}`;
    await new Promise((resolve, reject) => {
      exec(unzipCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error unzipping logs: ${error.message}`);
          reject(error);
        } else {
          console.log('Logs extracted successfully');
          resolve(stdout);
        }
      });
    });

    // Process each log file in the extracted directory
    const logsDir = path.join(__dirname, 'logs');
    const files = fs.readdirSync(logsDir);
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const logs = await processLogFile(path.join(logsDir, file));
        processedLogs.push(...logs);
      }
    }

    console.log('All logs processed and stored in Elasticsearch');
    return processedLogs;

  } catch (error) {
    console.error('Error fetching or processing logs:', error);
    return [];
  }
};