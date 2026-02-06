const fs = require("node:fs");
const path = require("node:path");
const express = require("express");

const router = express.Router();

const files = fs
  .readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".route.js"));

files.forEach((file) => {
  const routeName = file.replace(".route.js", "");
  const routePath = `/${routeName}`;

  const routeModule = require(path.join(__dirname, file));

  router.use(routePath, routeModule);
});

module.exports = router;
