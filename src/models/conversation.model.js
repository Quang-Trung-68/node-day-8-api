const db = require("@root/database");

async function createConversation(data) {
  const { created_by, name, type, participant_ids } = data;

  if (type === "direct") {
    const [{ insertId: conversation_id }] = await db.query(
      "INSERT INTO conversations (created_by,name, type) VALUES (?, ?, ?);",
      [created_by, name, type],
    );

    const all_participant_ids = [created_by, ...participant_ids];

    for (let index = 0; index < all_participant_ids.length; index++) {
      const [{ insertId: idConversationParticipants }] = await db.query(
        "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?);",
        [conversation_id, all_participant_ids[index]],
      );
    }

    return conversation_id;
  }

  if (type === "group") {
    const [{ insertId: conversation_id }] = await db.query(
      "INSERT INTO conversations (created_by, name, type) VALUES (?, ?, ?);",
      [created_by, name, type],
    );

    const all_participant_ids = [created_by, ...participant_ids];

    for (let index = 0; index < all_participant_ids.length; index++) {
      const [{ insertId: idConversationParticipants }] = await db.query(
        "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?,?);",
        [conversation_id, all_participant_ids[index]],
      );
    }

    return conversation_id;
  }
}

async function getAllConversations(data) {
  const { userId } = data;
  const sql = `
    SELECT DISTINCT
      c.id,
      c.name,
      c.type,
      c.created_at,
      c.updated_at
    FROM conversations c
    JOIN conversation_participants cp
      ON c.id = cp.conversation_id
    WHERE cp.user_id = ?
    ORDER BY c.updated_at DESC;
  `;

  const result = await db.query(sql, [userId]);
  return result;
}

async function addParticipantToConversation(data) {
  const { conversation_id, user_id } = data;
  const result = await db.query(
    "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?);",
    [conversation_id, user_id],
  );
  return result;
}

async function createMessage(data) {
  const { conversation_id, sender_id, content } = data;
  const result = await db.query(
    "INSERT INTO messages (conversation_id, sender_id, content) SELECT ?, ?, ? WHERE EXISTS ( SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?);",
    [conversation_id, sender_id, content, conversation_id, sender_id],
  );
  return result;
}

async function checkUserInConversation(data) {
  const { conversation_id, user_id } = data;
  const [rows] = await db.query(
    `
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = ?
      AND user_id = ?
    LIMIT 1;
    `,
    [conversation_id, user_id],
  );

  return rows.length > 0;
}

async function getAllMessages(data) {
  const { conversation_id } = data;
  const result = await db.query(
    "SELECT m.id, m.content, m.created_at, u.id AS sender_id, u.email AS sender_email FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.conversation_id = ? ORDER BY m.created_at DESC;",
    [conversation_id],
  );
  return result;
}

async function getParticipantsFromConversation(data) {
  const { userId, participant_ids } = data;
  const params = [userId, participant_ids];
  const result = await db.query(
    "SELECT c.id FROM conversations c JOIN conversation_participants cp ON cp.conversation_id = c.id WHERE c.type = 'direct' AND cp.user_id IN (?, ?) GROUP BY c.id HAVING COUNT(DISTINCT cp.user_id) = 2;",
    params,
  );
  return result;
}

async function countParticipants(data) {
  const { participant_ids } = data;
  const result = await db.query(
    "SELECT COUNT(DISTINCT id) AS total FROM users WHERE id IN (?);",
    [participant_ids],
  );
  return result;
}

module.exports = {
  createConversation,
  getAllConversations,
  addParticipantToConversation,
  createMessage,
  checkUserInConversation,
  getAllMessages,
  getParticipantsFromConversation,
  countParticipants,
};
