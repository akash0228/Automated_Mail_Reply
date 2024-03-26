const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const dotenv = require("dotenv");
dotenv.config();

const createOAuthClient = (clientId, clientSecret, redirectUri) => {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const createOAuth2Client = (clientId, clientSecret, redirectUri) => {
  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  });
};

const generateAuthorizationUrl = (oauthClient) => {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/gmail.modify",
  ];

  const authUrlOptions = {
    access_type: "offline",
    scope: scopes.join(" "),
  };

  return oauthClient.generateAuthUrl(authUrlOptions);
};

const getAccessToken = async (oauthClient, code) => {
  const { tokens } = await oauthClient.getToken(code);
  return tokens;
};

const setAccessToken = (oauthClient, token) => {
  oauthClient.setCredentials(token);
};

const refreshAccessToken = async (token) => {
  const clientId = process.env.CLIENTID;
  const clientSecret = process.env.CLIENTSECRET;
  const redirectUri = process.env.REDIRECTURI;

  const oauthClient = createOAuth2Client(clientId, clientSecret, redirectUri);
  oauthClient.setCredentials(token);
  try {
    const result = await oauthClient.refreshAccessToken();

    const tokens = result.res.data;
    return tokens;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  createOAuthClient,
  generateAuthorizationUrl,
  getAccessToken,
  setAccessToken,
  refreshAccessToken,
  createOAuth2Client,
};
