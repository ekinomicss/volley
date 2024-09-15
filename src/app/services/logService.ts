import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: process.env.ELASTICSEARCH_URL });

export const storeLog = async (logData: any) => {
  const response = await client.index({
    index: 'logs',
    body: logData,
  });
  return response;
};
