require("module-alias/register");
require("dotenv").config();
const tasks = require("@/tasks");
const queueService = require("@/services/queue.service");
const sleep = require("./src/utils/sleep");
const { taskStatus } = require("./src/configs/constants");

(async () => {
  console.log("Queue worker is running...");
  while (true) {
    const firstTask = await queueService.getPendingJob();
    if (firstTask) {
      const { id, type, payload: jsonPayload } = firstTask;
      try {
        console.log(`Task "${type}" (ID: ${id}) is processing...`);
        const payload = JSON.parse(jsonPayload);

        await queueService.updateStatus(id, taskStatus.inprogress);

        const handler = tasks[type];
        if (handler) {
          await handler(payload);
        } else {
          console.error(`Task '${type}' type is not defined.`);
        }

        await queueService.updateStatus(id, taskStatus.completed);
        console.log(`Task "${type}" processed.`);
      } catch (error) {
        console.error(`Task "${type}" (ID: ${id}) failed.`);
        console.error(error);
        await queueService.updateStatus(id, taskStatus.failed);
      }
    }
    await sleep(3000);
  }
})();
