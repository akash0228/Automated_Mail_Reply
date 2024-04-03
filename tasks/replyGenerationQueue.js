const { Queue } = require("bullmq");
const client=require('../config/redisConfig');


const replyGenerationQueue = new Queue("replyGenerationQueue",{ connection: client });

replyGenerationQueue.on("completed", (job) => {
  console.log(`Label job ${job.id} completed`);
});

replyGenerationQueue.on("failed", (job, err) => {
  console.error(`Label job ${job.id} failed with error: ${err.message}`);
});

module.exports = replyGenerationQueue;
