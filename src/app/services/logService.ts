import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
});

/* 
    Store the log data in Elasticsearch 
*/ 
export const storeLog = async (logData: any) => {

const structuredLog = {
    timestamp: new Date().toISOString(), 
    message: logData.message || 'No message provided',
    severity: logData.severity || 'No severity provided'
    };

  const response = await client.index({
    index: 'logs',
    body: structuredLog,
  });
  return response;
};
