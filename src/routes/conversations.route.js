const express = require("express");
const router = express.Router();
const conversationController = require("@/controllers/conversation.controller");
const authRequired = require("@/middlewares/authRequired");

router.post("/", authRequired, conversationController.createConversation);
router.get("/", authRequired, conversationController.getAllConversations);
router.post(
  "/:id/participants",
  authRequired,
  conversationController.addParticipantToConversation,
);
router.post(
  "/:id/messages",
  authRequired,
  conversationController.createMessage,
);
router.get(
  "/:id/messages",
  authRequired,
  conversationController.getAllMessages,
);

module.exports = router;
