import { Client } from '@elastic/elasticsearch';

const elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    tls: {
        rejectUnauthorized: false
    }
});

export default elasticClient;
