const { Queue } = require("bullmq");

const replyQueue = new Queue("replyQueue");
replyQueue.on("completed", (job) => {
  console.log(`Label job ${job.id} completed`);
});

replyQueue.on("failed", (job, err) => {
  console.error(`Label job ${job.id} failed with error: ${err.message}`);
});
module.exports = replyQueue;
