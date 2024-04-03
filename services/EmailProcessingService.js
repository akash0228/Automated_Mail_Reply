const { getUsers } = require("../dao/userDao");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const labelQueue = require("../tasks/labelQueue");
const labelWorker = require("../tasks/labelWorker");
const {
  createOAuthClient,
  refreshAccessToken,
} = require("./OauthGmailService");

dotenv.config();

const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const redirectUri = process.env.REDIRECTURI;

// console.log(clientId);

const processEmailsForUser = async (user) => {
  const oldtoken = {
    access_token: user.access_token,
    refresh_token: user.refresh_token,
    scope: user.scope,
    token_type: user.token_type,
    expiry_date: user.expiry_date,
  };

  const token = await refreshAccessToken(oldtoken);

  const oauth2Client = createOAuthClient(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials(token);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
    });
    const messages = res.data.messages;

    // Enqueue a job for each message in the label queue
    messages?.forEach((message) => {
      labelQueue.add("labelEmail", {
        message,
        token,
        email: user.email,
      });
      // console.log(message);
    });
  } catch (error) {
    console.error("Error listing messages:", error);
  }
};

const processEmailsForAllUsers = async () => {
  try {
    // console.log("processing");
    const users = await getUsers(); // Implement this function to retrieve users from the database
    users.forEach(processEmailsForUser);
  } catch (error) {
    console.error("Error retrieving users:", error);
  }
};

module.exports = { processEmailsForAllUsers };
