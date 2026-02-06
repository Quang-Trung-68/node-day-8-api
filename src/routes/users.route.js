const express = require("express");
const router = express.Router();
const userController = require("@/controllers/user.controller");
const authRequired = require("@/middlewares/authRequired");

router.get("/search", authRequired, userController.getUsersByEmail);

module.exports = router;
