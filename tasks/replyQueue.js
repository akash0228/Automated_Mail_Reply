const { Queue } = require("bullmq");
const client=require('../config/redisConfig');

const replyQueue = new Queue("replyQueue",{ connection: client });
replyQueue.on("completed", (job) => {
  console.log(`Label job ${job.id} completed`);
});

replyQueue.on("failed", (job, err) => {
  console.error(`Label job ${job.id} failed with error: ${err.message}`);
});
module.exports = replyQueue;
