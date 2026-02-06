const queueModel = require("@/models/queue.model");

class QueueService {
  async push(type, payload) {
    const jsonPayload = JSON.stringify(payload);
    await queueModel.push({ type, jsonPayload });
  }

  async getPendingJob() {
    const result = await queueModel.getPendingJob();
    return result;
  }

  async updateStatus(id, status) {
    await queueModel.updateStatus({ id, status });
  }
}

module.exports = new QueueService();
