const { Worker } = require("bullmq");
const Redis = require("ioredis");
const { sendReply } = require("../services/GmailServices");
const redisClient = new Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
  });

const processreplyJob = async (job) => {
  
    const emailData = job.data; 
    console.log(`replying email with ID ${emailData.message.id}`);
    // console.log(emailData);
    try {
        const res=await sendReply(emailData.message,emailData.token,emailData.reply);
        console.log("Replied");
        return { success: true };
    } catch (error) {
        console.log(error);
    }
  };
  
  
  const replyWorker = new Worker('replyQueue', async (job) => {
    try {
      return await processreplyJob(job);
    } catch (err) {
      console.error(`Error processing reply job ${job.id}: ${err.message}`);
      throw err;
    }
  },{ connection: redisClient });
  
  module.exports = replyWorker;