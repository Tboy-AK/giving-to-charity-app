const nodemailer = require('nodemailer');
const logger = require('./winston-logger');

/**
 * @description Send email to specified email address
 * @param {String} toAddress Email address to send email to
 * @param {String} subject Subject matter of the email
 * @param {String} text Raw text format to send with email
 * @param {String} html HTML text format to send with email
 */
module.exports = async (toAddress, subject, text, html) => {
  let port;
  const portNumber = parseInt(process.env.SMTP_PORT, 10);
  // eslint-disable-next-line no-restricted-globals
  if (!portNumber || isNaN(portNumber)) return Promise.reject(new Error('SMTP port must be a non-negative, non-zero number'));

  const option = {
    host: process.env.SMTP_HOST,
    port,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  const transport = nodemailer.createTransport(option);

  const mailOptions = {
    from: '"Give to Charity" <noreply@givetocharity.com>',
    to: toAddress,
    subject,
    text,
    html,
  };

  if (!html) delete mailOptions.html;
  if (!text) delete mailOptions.text;

  return transport.sendMail(mailOptions)
    .catch((err) => logger.error(err));
};
