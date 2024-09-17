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
    severity: logData.severity || 'info',  // Provide default severity as 'info'
  };

  console.log('Structured Log:', structuredLog);  // Debugging to see the log data

  try {
    const response = await client.index({
      index: 'logs',
      body: structuredLog,
    });
    console.log('Log successfully stored:', response);  // Debugging to check success
    return response;
  } catch (error) {
    console.error('Error storing log in Elasticsearch:', error);  // Error handling
    throw error;
  }
};