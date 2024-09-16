import { Client } from '@elastic/elasticsearch';
const client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

export const getHistoricalLogs = async (criteria: any) => {
  const result = await client.search({
    index: 'logs',
    body: {
      query: {
        match: criteria
      }
    }
  });
  return result.hits.hits;
};
