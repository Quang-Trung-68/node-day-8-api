require("module-alias/register");

const driveService = require("@/services/drive.service");

async function backupDB() {
  await driveService.backupDB();
}

module.exports = backupDB;
