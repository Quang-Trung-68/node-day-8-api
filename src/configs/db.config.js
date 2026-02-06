const fs = require("node:fs");
const path = require("path");

const caPath = path.join(process.cwd(), "isrgrootx1.pem");

const dbConfig = {
  // DB
  host: process.env.DB_HOST || "localhost", // Địa chỉ server MySQL, mặc định localhost
  user: process.env.DB_USER, // Username MySQL
  password: process.env.DB_PASS, // Password MySQL
  database: process.env.DB_NAME, // Tên database
  port: process.env.DB_PORT || 3306, // Port MySQL, mặc định 3306
  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },

  // Backup
  backupReceiverEmail: process.env.DB_BACKUP_RECEIVER_EMAIL,
  backupLocalDir: process.env.DB_BACKUP_LOCAL_DIR,
  backupRemote: process.env.DB_BACKUP_REMOTE,
  backupRemoteDir: process.env.DB_BACKUP_REMOTE_DIR,
  backupRemoteLocationLink: process.env.DB_BACKUP_REMOTE_LOCATION_LINK,
};

module.exports = dbConfig;
