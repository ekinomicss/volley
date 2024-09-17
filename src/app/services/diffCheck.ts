import { Client } from '@elastic/elasticsearch';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_TOKEN });

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

export async function analyzeLogHistory(newLogs: Log[], oldLogs: Log[]): Promise<string> {
  const diffs: { oldLog: Log, newLog: Log }[] = [];

  newLogs.forEach((newLog) => {
    oldLogs.forEach((oldLog) => {
      if (newLog.message !== oldLog.message) {
        diffs.push({ oldLog, newLog });
      }
    });
  });

  if (diffs.length === 0) {
    return "No significant differences found between new and old logs.";
  }

  const prompt = `Analyze the following log differences and identify which log likely caused the error message. 

    ${diffs.map(diff => `
    Old Log:
    Timestamp: ${diff.oldLog.timestamp}
    Severity: ${diff.oldLog.severity}
    Message: ${diff.oldLog.message}

    New Log:
    Timestamp: ${diff.newLog.timestamp}
    Severity: ${diff.newLog.severity}
    Message: ${diff.newLog.message}
    `).join('\n')}

    Which log entry is most likely to have caused an error, and why? Answer in maximum 3 sentences. Keep it concise. Use bullet points and try to point to a specific deploy and/or commit hash.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message?.content || "Unable to analyze logs.";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Error occurred while analyzing logs.";
  }
}