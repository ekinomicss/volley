import { Log } from '../types/Log';  // Adjust the import path as needed
import { getDeploymentInfo } from './deploymentService';  // A service that gets deployment info
import { detectLogDifferences } from './diffCheck';       // Existing diff detection logic

export const notifySlack = async (newLogs: Log[], oldLogs: Log[]) => {
    // Compare new logs with old logs
    const diffs = detectLogDifferences(newLogs, oldLogs);
    
    if (diffs.length > 0) {
        // Fetch deployment info (e.g., Git commit or deploy ID)
        const deploymentInfo = await getDeploymentInfo();
        
        // Prepare the message to print to the console
        const message = `
        🚨 Regression detected!
        Detected differences between new logs and previous logs:
        
        Diffs:
        ${diffs.map(diff => `- Old: ${diff.oldLog}, New: ${diff.newLog}`).join('\n')}
        
        Caused by deployment: ${deploymentInfo.deployId}
        Deployment details: ${deploymentInfo.deployDetails}
        `;
        
        // Print the message to the console
        console.log(message);
    } else {
        console.log('No differences detected between logs.');
    }
};
