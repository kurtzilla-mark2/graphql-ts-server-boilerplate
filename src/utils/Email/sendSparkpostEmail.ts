import * as SparkPost from 'sparkpost';

const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendSparkpostEmail = async (recipient: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: 'testing@sparkpostbox.com',
      subject: 'hello world',
      html: `<html><body><p>testing sparkpost</p><p><a href="${url}">confirm email</a></p></body></html>`
    },
    recipients: [{ address: recipient }]
  });

  console.log(response);
};
