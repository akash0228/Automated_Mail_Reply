const { Queue } = require("bullmq");

const replyGenerationQueue = new Queue("replyGenerationQueue");

replyGenerationQueue.on("completed", (job) => {
  console.log(`Label job ${job.id} completed`);
});

replyGenerationQueue.on("failed", (job, err) => {
  console.error(`Label job ${job.id} failed with error: ${err.message}`);
});

module.exports = replyGenerationQueue;
