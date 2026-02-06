const db = require("@root/database");
const { taskStatus } = require("@/configs/constants");

async function push(data) {
  const { type, jsonPayload } = data;
  await db.query("insert into queues (type, payload) values (?, ?)", [
    type,
    jsonPayload,
  ]);
  return null;
}

async function getPendingJob() {
  const [rows] = await db.query(
    "select * from queues where status = ? order by id limit 1",
    [taskStatus.pending],
  );
  const firstTask = rows[0];
  return firstTask ?? null;
}

async function updateStatus(data) {
  const { id, status } = data;
  await db.query("update queues set status = ? where id = ?", [status, id]);
  return null;
}

module.exports = { push, getPendingJob, updateStatus };
