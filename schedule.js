require("dotenv").config();
const { CronJob } = require("cron");

const backupDB = require("./src/schedules/backupDB");
const cleanupExpiredTokens = require("./src/schedules/cleanupExpiredTokens");

new CronJob("0 3 * * *", backupDB).start();

new CronJob("0 1 * * *", cleanupExpiredTokens).start();
