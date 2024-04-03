const { Worker } = require("bullmq");
// const Redis = require("ioredis");
const { generateReply } = require("../services/googleAiService");
const replyQueue = require("./replyQueue");
const client=require('../config/redisConfig');
// const redis = require('redis');
// const createClient = redis.createClient;

// const client = createClient({
//   password: 'Rt3aekDRSkxTFtRHgf5lrlkM1F9nJsg0',
//   socket: {
//       host: 'redis-13488.c305.ap-south-1-1.ec2.cloud.redislabs.com',
//       port: 13488
//   }
// });

// const redisClient = new Redis({
//   host: "localhost",
//   port: 6379,
//   maxRetriesPerRequest: null,
// });



const processreplyGenerationJob = async (job) => {
  const emailData = job.data;
  console.log(`replyGenerationing email with ID ${emailData.message.id}`);
  const reply=await generateReply(emailData.content,emailData.labelName);

  //add to reply send queue
  replyQueue.add("replyEmail",{message:emailData.message,token:emailData.token,reply});
  return { success: true };
};

const replyGenerationWorker = new Worker(
  "replyGenerationQueue",
  async (job) => {
    try {
      await processreplyGenerationJob(job);
    } catch (err) {
      console.error(
        `Error processing replyGeneration job ${job.id}: ${err.message}`
      );
      throw err;
    }
  },
  { connection: client }
);

module.exports = replyGenerationWorker;
