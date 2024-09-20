import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE_URL, 
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY || '',
  },
});

// Function to fetch logs from Elasticsearch
export const fetchElasticsearchLogs = async (index: string, size = 100) => {
  try {
    const response = await client.search({
      index: index,
      size: size,
      query: {
        match_all: {}, 
      },
    //   sort: [{ '@timestamp': { order: 'desc' } }]?
    });

    const hits = response.hits.hits;

    // Extract the log messages from the response
    const logs = hits.map((hit: any) => {
      return {
        timestamp: hit._source['@timestamp'],
        message: hit._source.message || hit._source.log || JSON.stringify(hit._source, null, 2),
      };
    });

    return logs;
  } catch (error) {
    console.error('Error fetching logs from Elasticsearch:', error);
    return [];
  }
};

export const prepareLogsForGPT = (logs: any[]) => {
  return logs.map(log => `Timestamp: ${log.timestamp}\nLog Message: ${log.message}\n`).join('\n---\n');
};

const indexName = 'app-logs'; 

fetchElasticsearchLogs(indexName)
  .then(logs => {
    const formattedLogs = prepareLogsForGPT(logs);
    console.log('Formatted Logs for GPT Analysis:\n', formattedLogs);
  })
  .catch(error => {
    console.error('Failed to retrieve or format logs:', error);
  });