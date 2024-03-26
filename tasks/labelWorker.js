const { Worker } = require("bullmq");
const { google } = require("googleapis");
const Redis = require("ioredis");
const {
  getAccessToken,
  refreshAccessToken,
} = require("../services/OauthGmailService");
const { default: axios } = require("axios");
const { categorizeContent } = require("../services/googleAiService");

const {
  getMessageContent,
  createLabel,
  addLabel,
} = require("../services/GmailServices");
const replyGenerationQueue = require("./replyGenerationQueue");

const redisClient = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

const processLabelJob = async (job) => {
  const emailData = job.data;
  const messageId = emailData.message.id;
  const token = emailData.token;

  const Token = await refreshAccessToken(token);
  const accessToken = Token.access_token;

  try {
    //add to reply generation queue
    const decodedContent = await getMessageContent(messageId, token);
    console.log(decodedContent);

    //get label from ai
    const labelName = await categorizeContent(decodedContent);
    console.log(labelName);

    const labelId = await createLabel(labelName, token);
    console.log(labelId);

    const addLabelRes = await addLabel(
      messageId,
      token,
      labelId
    );

    // console.log(addLabelRes);
    
    replyGenerationQueue.add("replyGenerate",{
        message:emailData.message,
        content:decodedContent,
        token:emailData.token,
        labelName
    });
    
    return { success: true };
  } catch (err) {
    console.error(`Error processing label job ${job.id}: ${err.message}`);
    throw err;
  }
};

const labelWorker = new Worker(
  "labelQueue",
  async (job) => {
    //   console.log("new work");
    try {
      await processLabelJob(job);
    } catch (err) {
      console.error(`Error processing label job ${job.id}: ${err.message}`);
      throw err;
    }
  },
  { connection: redisClient }
);

module.exports = labelWorker;
