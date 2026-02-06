const mailConfig = {
  fromName: process.env.MAIL_FROM_NAME,
  fromAddress: process.env.MAIL_FROM_ADDRESS,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  supportLink: process.env.MAIL_SUPPORT_LINK,
};

module.exports = mailConfig;
