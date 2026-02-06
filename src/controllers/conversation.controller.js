const conversationService = require("@root/src/services/conversation.service");
const catchAsync = require("@/utils/catchAsync");
const { httpCodes } = require("../configs/constants");

const createConversation = catchAsync(async (req, res) => {
  const userId = req.currentUser.id;
  const conversationData = req.body;

  const result = await conversationService.createConversation(
    userId,
    conversationData,
  );

  return res.success(result, null, httpCodes.created);
});

const getAllConversations = catchAsync(async (req, res) => {
  const userId = req.currentUser.id;

  const result = await conversationService.getUserConversations(userId);

  return res.success(result);
});

const addParticipantToConversation = catchAsync(async (req, res) => {
  const conversationId = +req.params.id;
  const { user_id } = req.body;
  const userAuthId = req.currentUser.id;

  const result = await conversationService.addParticipant(
    userAuthId,
    conversationId,
    user_id,
  );

  return res.success(result, null, httpCodes.created);
});

const createMessage = catchAsync(async (req, res) => {
  const conversationId = +req.params.id;
  const senderId = req.currentUser.id;
  const { content } = req.body;

  const result = await conversationService.createMessage(
    conversationId,
    senderId,
    content,
  );

  return res.success(result, null, httpCodes.created);
});

const getAllMessages = catchAsync(async (req, res) => {
  const conversationId = +req.params.id;
  const userId = req.currentUser.id;

  const result = await conversationService.getConversationMessages(
    conversationId,
    userId,
  );

  return res.success(result);
});

module.exports = {
  createConversation,
  getAllConversations,
  addParticipantToConversation,
  createMessage,
  getAllMessages,
};
