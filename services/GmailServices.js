const axios = require("axios");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const { createOAuthClient } = require("./OauthGmailService");
dotenv.config();

const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const redirectUri = process.env.REDIRECTURI;

const auth = createOAuthClient(clientId, clientSecret, redirectUri);

const getMessageContent = async (messageId, Tokens) => {
  auth.setCredentials(Tokens);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });
  const message = res.data;

  const snippet = message.snippet;
  const subject = message.payload.headers.find(
    (header) => header.name === "Subject"
  ).value;

  const textPlainPart = message.payload.parts.find(
    (part) => part.mimeType === "text/plain"
  );
  const content = textPlainPart?.body?.data;
  const decodedContent = Buffer.from(content, "base64").toString("utf-8");
  return decodedContent;
};

const createLabel = async (labelName, Tokens) => {
  auth.setCredentials(Tokens);
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const res = await gmail.users.labels.list({ userId: "me" });
    const labels = res.data.labels;
    // console.log(labels);
    for (let i = 0; i < labels.length; i += 1) {
      const { name, id } = labels[i];
      if (name === labelName) {
        return id;
      }
    }

    const result = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    return result.data.id;
  } catch (error) {
    console.error("Error creating label:", error);
    throw error;
  }
};

const addLabel = async (messageId, Tokens, labelId) => {
  auth.setCredentials(Tokens);
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const addLabelRes = await gmail.users.messages.modify({
      addLabelIds: [labelId],
      id: messageId,
      userId: "me",
    });
    return addLabelRes.data;
  } catch (error) {
    console.error("Error adding label:", error);
    throw error;
  }
};

const sendReply = async (message, Tokens, reply) => {
  auth.setCredentials(Tokens);
  const gmail = google.gmail({ version: "v1", auth });
  try {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From"],
    });

    const subject = res.data.payload.headers.find(
      (header) => header.name == "Subject"
    ).value;
    const from = res.data.payload.headers.find(
      (header) => header.name == "From"
    ).value;

    const replyTo = from.match(/<(.*)>/)[1];
    const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;

    const rawMessage = [
      `From: me`,
      `To: ${replyTo}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${message.id}`,
      `References: ${message.id}`,
      ``,
      reply,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "-")
      .replace(/=+$/, "");

    const replyMessage = `Content-Type: text/plain; charset="UTF-8"\n\n${reply}`;

    const result = await gmail.users.messages.send({
      userId: "me",
      threadId: message.threadId,
      requestBody: {
        raw: encodedMessage,
      },
    });

    const response = await gmail.users.messages.modify({
      removeLabelIds: ["UNREAD"],
      id: message.id,
      userId: "me",
    });
    return result;
  } catch (error) {
    console.error("Error in sending reply:", error);
    throw error;
  }
};

module.exports = { addLabel, createLabel, getMessageContent, sendReply };
