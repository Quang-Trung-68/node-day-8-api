const mailService = require("@/services/mail.service");

async function sendBackupDBEmail(payload) {
  await mailService.sendBackupDBEmail(payload);
}

module.exports = sendBackupDBEmail;
