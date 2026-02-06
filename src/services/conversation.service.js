const conversationModel = require("@/models/conversation.model");
const { httpCodes } = require("@/configs/constants");
const AppError = require("@/utils/AppError");

class ConversationService {
  async createConversation(userId, conversationData) {
    try {
      const { name, type, participant_ids } = conversationData;

      if (!type || !["direct", "group"].includes(type)) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Invalid conversation type. Must be 'direct' or 'group'.",
        );
      }

      if (
        !participant_ids ||
        !Array.isArray(participant_ids) ||
        participant_ids.length === 0
      ) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Participant_ids is required and must be a non-empty array.",
        );
      }

      if (Array.isArray(participant_ids)) {
        const data = { participant_ids };
        const countValidUsers = await conversationModel.countParticipants(data);
        const [rows] = countValidUsers;
        const { total } = rows[0];
        const isValidUsers = participant_ids.length === total;
        if (!isValidUsers) {
          throw new AppError(
            httpCodes.badRequest || 400,
            "One or more participants do not exist.",
          );
        }
      }

      if (type === "direct" && participant_ids.length !== 1) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Direct conversation must have exactly 1 participant.",
        );
      }

      if (participant_ids.includes(userId)) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Participant_ids cannot contain the creator's ID.",
        );
      }

      if (type === "direct") {
        const data = {
          userId,
          participant_ids: participant_ids[0],
        };
        const result =
          await conversationModel.getParticipantsFromConversation(data);
        if (result[0].length > 0) {
          throw new AppError(
            httpCodes.badRequest || 400,
            "Conversation is existed.",
          );
        }
      }

      if (type === "group" && !name) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Direct conversation name is required.",
        );
      }

      const data = {
        created_by: userId,
        name,
        type,
        participant_ids,
      };

      const conversationId = await conversationModel.createConversation(data);

      return {
        user_id: userId,
        conversation_id: conversationId,
        name,
        type,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserConversations(userId) {
    try {
      const data = { userId };
      const conversations = await conversationModel.getAllConversations(data);

      return {
        user_id: userId,
        conversations: conversations[0] || [],
      };
    } catch (error) {
      throw error;
    }
  }

  async addParticipant(userAuthId, conversationId, userId) {
    try {
      if (!conversationId || !userId) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Conversation_id and user_id are required.",
        );
      }

      const participant_ids = [userId];
      if (Array.isArray(participant_ids)) {
        const data = { participant_ids };
        const countValidUsers = await conversationModel.countParticipants(data);
        const [rows] = countValidUsers;
        const { total } = rows[0];
        const isValidUsers = participant_ids.length === total;
        if (!isValidUsers) {
          throw new AppError(
            httpCodes.badRequest || 400,
            "One participant do not exist.",
          );
        }
      }

      const isUserAuthInConversation =
        await conversationModel.checkUserInConversation({
          conversation_id: conversationId,
          user_id: userAuthId,
        });

      if (!isUserAuthInConversation) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "You are not a participant of this conversation.",
        );
      }

      const isValidInConversation =
        await conversationModel.checkUserInConversation({
          conversation_id: conversationId,
          user_id: userId,
        });

      if (isValidInConversation) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "User is already a participant of this conversation.",
        );
      }

      const data = { conversation_id: conversationId, user_id: userId };
      const resultData =
        await conversationModel.addParticipantToConversation(data);

      return {
        conversation_participant_id: resultData[0].insertId,
        conversation_id: conversationId,
        user_id: userId,
      };
    } catch (error) {
      throw error;
    }
  }

  async createMessage(conversationId, senderId, content) {
    try {
      if (!content || content.trim().length === 0) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Message content cannot be empty.",
        );
      }

      if (content.length > 5000) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Message content is too long (max 5000 characters).",
        );
      }

      const data = {
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
      };

      const resultData = await conversationModel.createMessage(data);
      const { insertId, affectedRows } = resultData[0];

      if (affectedRows === 0) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "User is not a participant of this conversation.",
        );
      }

      return {
        id: insertId,
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        created_at: new Date(),
      };
    } catch (error) {
      throw error;
    }
  }

  async getConversationMessages(conversationId, userId) {
    try {
      if (!conversationId) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Conversation_id is required.",
        );
      }

      const checkData = { conversation_id: conversationId, user_id: userId };
      const isValidInConversation =
        await conversationModel.checkUserInConversation(checkData);
      if (!isValidInConversation) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "User is not a participant of this conversation.",
        );
      }

      const data = { conversation_id: conversationId };
      const resultData = await conversationModel.getAllMessages(data);
      const rows = resultData[0] || [];

      return {
        conversation_id: conversationId,
        messages: rows.map((row) => ({
          id: row.id,
          content: row.content,
          created_at: row.created_at,
          sender: {
            id: row.sender_id,
            email: row.sender_email,
          },
        })),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ConversationService();
