const { Queue } = require("bullmq");
const client=require('../config/redisConfig');


const labelQueue = new Queue("labelQueue", { connection: client });

labelQueue.on("completed", (job) => {
  console.log(`Label job ${job.id} completed`);
});

labelQueue.on("failed", (job, err) => {
  console.error(`Label job ${job.id} failed with error: ${err.message}`);
});

module.exports = labelQueue;
