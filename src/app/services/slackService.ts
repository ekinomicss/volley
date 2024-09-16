import { IncomingWebhook } from '@slack/webhook';
import { Log } from '../types/Log';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url!);

export const notifySlack = async (newLogs: Log[], diffs: string[]) => {
	const errorLogs = newLogs.filter(log => log.severity.toLowerCase() === 'error');

	if (errorLogs.length === 0 && diffs.length === 0) {
		console.log('No error logs or differences found. Skipping Slack notification.');
		return;
	}

	const errorSummary = errorLogs.map(log => 
		`[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.message}`
	).join('\n');

	const diffSummary = diffs.join('\n');

	const message = `
		🚨 Volley AI Log Analysis:
		
		${errorLogs.length > 0 ? `Error Logs:\n${errorSummary}\n\n` : ''}
		${diffs.length > 0 ? `Log Differences:\n${diffSummary}` : ''}
	`;

	try {
		await webhook.send({
			text: message
		});
		console.log('Slack notification sent with error logs and/or differences.');
	} catch (error) {
		console.error('Error sending Slack message:', error);
	}
};

// Remove or comment out the unused sendSlackNotification function
