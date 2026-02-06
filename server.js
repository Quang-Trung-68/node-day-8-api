require("module-alias/register");
require("dotenv").config();
const express = require("express");
const corsOptions = require("@/configs/cors.config");
const cors = require("cors");
const routes = require("@/routes");

const responseFormat = require("./src/middlewares/responseFormat");
const { apiRateLimiter } = require("./src/middlewares/rateLimiter");
const notFoundHandler = require("./src/middlewares/notFoundHandler");
const exceptionHandler = require("./src/middlewares/exceptionHandler");
const appConfig = require("./src/configs/app.config");

const app = express();

app.use(responseFormat);
app.use(express.json());
app.use(apiRateLimiter);
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("API is ready");
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(exceptionHandler);

app.listen(appConfig.port, () => {
  console.log("Server running on port: ", appConfig.port);
});
