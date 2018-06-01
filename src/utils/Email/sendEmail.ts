import { sendSparkpostEmail } from './sendSparkpostEmail';

// @todo put email provider selection into config file
// if(config.emailProvider === 'Sparkpost'){}

export const sendEmail = async (recipient: string, url: string) => {
  if (process.env.NODE_ENV !== 'test') {
    await sendSparkpostEmail(recipient, url);
  }
};
