import { IncomingWebhook } from '@slack/webhook';

const url = process.env.SLACK_WEBHOOK_URL;
// const webhook = new IncomingWebhook(url);

// export const sendSlackMessage = async (message: string) => {
//   await webhook.send({
//     text: message,
//   });
// };
