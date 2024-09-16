import { IncomingWebhook } from '@slack/webhook';
import { Log } from '../types/Log';
import dotenv from 'dotenv';
import { detectLogDifferences } from './diffCheck';

dotenv.config();

const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url!);

export const notifySlack = async (newLogs: Log[], oldLogs: Log[]) => {
	const differences = detectLogDifferences(newLogs, oldLogs);

	const logsSummary = newLogs.map(log => 
		`[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.message}`
	).join('\n');

	const diffsSummary = differences.map(diff => 
		`Old: [${diff.oldLog?.severity?.toUpperCase() ?? 'N/A'}] ${diff.oldLog?.timestamp ?? 'N/A'}: ${diff.oldLog?.message ?? 'N/A'}\n` +
		`New: [${diff.newLog?.severity?.toUpperCase() ?? 'N/A'}] ${diff.newLog?.timestamp ?? 'N/A'}: ${diff.newLog?.message ?? 'N/A'}`
	).join('\n\n');

	const message = `
		📊 GitHub Actions Logs Summary:
		
		${logsSummary}
		
		🔄 Log Differences:
		${diffsSummary}
	`;

	try {
		await webhook.send({
			text: message
		});
		console.log('Slack notification sent.');
	} catch (error) {
		console.error('Error sending Slack message:', error);
	}
};

function sendSlackNotification(message: string) {
  // Ensure the full log message is included in the Slack notification
  const slackMessage = `New log detected:\n\`\`\`\n${message}\n\`\`\``;
  console.log(slackMessage); // This should now log the full message
  // ... rest of the function
}
