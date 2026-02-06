require("dotenv").config();
require("module-alias/register");
const dbConfig = require("@/configs/db.config");
const { getDateStringYmdHms } = require("@/utils/time");
const AppError = require("../utils/AppError");
const { httpCodes } = require("../configs/constants");

const { exec: childExec } = require("node:child_process");
const { promisify } = require("node:util");
const queueService = require("./queue.service");
const exec = promisify(childExec);

class DriveService {
  async backupDB() {
    const { host, user, password, database, port } = dbConfig;
    const dateString = getDateStringYmdHms();
    const {
      backupLocalDir,
      backupRemote,
      backupRemoteDir,
      backupReceiverEmail,
    } = dbConfig;

    try {
      const fileName = `${backupLocalDir}/${database}_${dateString}.sql`;

      // Dump .sql file
      const backupCmd = `mysqldump -u${user} -p${password} -h${host} -P${port} ${database} > ${fileName}`;
      await exec(backupCmd);
      console.log("Backup DB successfully!");

      // Backup to remote db
      const copyCmd = `rclone copy ${backupLocalDir} ${backupRemote}:${backupRemoteDir}`;
      await exec(copyCmd);
      console.log("Upload to Google Drive successfully!");

      await queueService.push("sendBackupDBEmail", {
        email: backupReceiverEmail,
        fileName: `${database}_${dateString}.sql`,
      });
    } catch (error) {
      console.log(error);
      throw new AppError(
        httpCodes.internalServerError || 500,
        "Backup DB failed!",
      );
    }
  }
}

module.exports = new DriveService();
