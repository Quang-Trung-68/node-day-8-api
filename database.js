const mysql = require("mysql2/promise");
const dbConfig = require("@/configs/db.config");

const db = mysql.createPool(dbConfig);

module.exports = db;
