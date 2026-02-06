const ejs = require("ejs");
const path = require("node:path");
const { Resend } = require("resend");

const mailConfig = require("@/configs/mail.config");
const authService = require("@/services/auth.service");
const authConfig = require("../configs/auth.config");
const dbConfig = require("../configs/db.config");

const resend = new Resend(mailConfig.resendApiKey);

class MailService {
  getTemplatePath(template) {
    return path.join(
      __dirname,
      "..",
      "resource",
      "mail",
      `${template.replace(".ejs", "")}.ejs`,
    );
  }

  async send(options) {
    const { template, templateData, ...restOptions } = options;

    const templatePath = this.getTemplatePath(template);
    const html = await ejs.renderFile(templatePath, templateData);

    const result = await resend.emails.send({
      ...restOptions,
      html,
    });

    return result;
  }

  async sendVerificationEmail(user) {
    const { fromName, resendFromEmail } = mailConfig;
    const fromAddress = resendFromEmail || "onboarding@resend.dev";

    const verificationLink = authService.generateVerificationLink(user);

    const verificationEmailTTL = authConfig.verificationEmailTokenTTL / 3600;

    return this.send({
      from: `"${fromName}" <${fromAddress}>`,
      to: user.email,
      subject: "[Account Update] Email verification",
      template: "auth/verificationEmail",
      templateData: {
        verificationLink,
        verificationEmailTTL,
      },
    });
  }

  async sendPasswordChangeEmail(user) {
    const { fromName, resendFromEmail, supportLink } = mailConfig;
    const fromAddress = resendFromEmail || "onboarding@resend.dev";

    const changeTime = new Date().toLocaleString("vi-VN");

    return this.send({
      from: `"${fromName}" <${fromAddress}>`,
      to: user.email,
      subject: "[Account Update] Password changed",
      template: "auth/changePassword",
      templateData: {
        changeTime,
        supportLink,
      },
    });
  }

  async sendBackupDBEmail(payload) {
    const { fromName, resendFromEmail } = mailConfig;
    const { database, backupRemoteLocationLink } = dbConfig;
    const fromAddress = resendFromEmail || "onboarding@resend.dev";

    const backupTime = new Date().toLocaleString("vi-VN");

    return this.send({
      from: `"${fromName}" <${fromAddress}>`,
      to: payload.email,
      subject: "[Backup Database] Database backup",
      template: "backup/backupDB",
      templateData: {
        fileName: payload.fileName,
        backupTime,
        databaseName: database,
        backupLocationLink: backupRemoteLocationLink,
      },
    });
  }
}

module.exports = new MailService();
