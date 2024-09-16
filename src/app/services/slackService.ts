import { IncomingWebhook } from '@slack/webhook';
import { Log } from '../types/Log';  
import { getDeploymentInfo } from './deploymentService';  
import { detectLogDifferences } from './diffCheck';       
import dotenv from 'dotenv';

dotenv.config(); 

const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url!);  // The `!` asserts that the URL is defined

export const notifySlack = async (newLogs: Log[], oldLogs: Log[]) => {
    // Compare new logs with old logs
    const diffs = detectLogDifferences(newLogs, oldLogs);
    
    if (diffs.length > 0) {
        // Fetch deployment info (e.g., Git commit or deploy ID)
        const deploymentInfo = await getDeploymentInfo();
        
        // Prepare the message to send to Slack
        const message = `
        🚨 Regression detected!
        Detected differences between new logs and previous logs:
        
        Diffs:
        ${diffs.map(diff => `- Old: ${diff.oldLog.message}, New: ${diff.newLog.message}`).join('\n')}
        
        Caused by deployment: ${deploymentInfo.deployId}
        Deployment details: ${deploymentInfo.deployDetails}
        `;

        try {
            // Send the message to Slack
            await webhook.send({
                text: message
            });
            console.log('Slack notification sent.');
        } catch (error) {
            console.error('Error sending Slack message:', error);
        }
    } else {
        console.log('No differences detected between logs.');
    }
};
