import { Client } from '@elastic/elasticsearch';
const client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });


export interface Log {
  timestamp: Date;
  message: string;
  severity: string;
}

export const getOldLogs = async (query: any): Promise<Log[]> => {
  const result = await client.search({
    index: 'logs',
    body: {
      query: {
        match: { message: query.message }
      }
    }
  });

  // Map Elasticsearch hits to your custom Log structure
  return result.hits.hits.map((hit: any) => ({
    message: hit._source.message,
    severity: hit._source.severity,
    timestamp: hit._source.timestamp
  }));
};

export function detectLogDifferences(newLogs: Log[], oldLogs: Log[]): Array<{ oldLog: Log, newLog: Log }> {
  const diffs: { oldLog: Log, newLog: Log }[] = [];

  newLogs.forEach((newLog) => {
    oldLogs.forEach((oldLog) => {
      if (newLog.message !== oldLog.message) {
        diffs.push({ oldLog, newLog });
      }
    });
  });

  return diffs;
}