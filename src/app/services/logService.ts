import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: process.env.ELASTICSEARCH_URL });


/* 
    Store the log data in Elasticsearch 
*/ 
export const storeLog = async (logData: any) => {

const structuredLog = {
    timestamp: new Date().toISOString(), 
    message: logData.message || 'No message provided'
    };

  const response = await client.index({
    index: 'logs',
    body: structuredLog,
  });
  return response;
};
