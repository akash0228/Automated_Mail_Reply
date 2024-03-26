const { Queue } = require("bullmq");

const labelQueue = new Queue("labelQueue");

labelQueue.on("completed", (job) => {
  console.log(`Label job ${job.id} completed`);
});

labelQueue.on("failed", (job, err) => {
  console.error(`Label job ${job.id} failed with error: ${err.message}`);
});

module.exports = labelQueue;
