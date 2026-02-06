require("dotenv").config();
const { CronJob } = require("cron");

const backupDB = require("./src/schedules/backupDB");

new CronJob("*/1 * * * *", backupDB).start();
