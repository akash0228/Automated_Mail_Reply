const connection = require("../config/mySqlConfig");
const { google } = require("googleapis");
const { addUser } = require("../dao/userDao");
const {
  createOAuthClient,
  generateAuthorizationUrl,
  getAccessToken,
  setAccessToken,
} = require("../services/OauthGmailService");
const dotenv = require("dotenv");
const {
  acquireTokenO,
  createMSALClient,
  getUserEmail,
  generateAuthUrlO,
} = require("../services/OauthOutlookService");

dotenv.config();

const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const redirectUri = process.env.REDIRECTURI;

const authority = process.env.TENET_URL;

const oauthServiceGmail = createOAuthClient(
  clientId,
  clientSecret,
  redirectUri
);

const msalClient = createMSALClient(authority);

const fetchUserEmail = async () => {
  const gmail = google.gmail({ version: "v1", auth: oauthServiceGmail });
  const userInfo = await gmail.users.getProfile({ userId: "me" });
  return userInfo.data.emailAddress;
};

const registerGmailController = async (req, res) => {
  try {
    const authorizationUrl = generateAuthorizationUrl(oauthServiceGmail);
    res.redirect(authorizationUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const registerOutlookController = async (req, res) => {
  try {
    const authorizationUrl = await generateAuthUrlO(msalClient);
    res.redirect(authorizationUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const callbackController = async (req, res) => {
  const authCode = req.query.code;
  try {
    const token = await getAccessToken(oauthServiceGmail, authCode);
    setAccessToken(oauthServiceGmail, token);
    // Fetch email
    const email = await fetchUserEmail();

    // Store tokens securely and associate with user's email in database
    const user = await addUser(
      email,
      token.access_token,
      token.access_token,
      token.token_type,
      token.expiry_date,
      token.scope
    );
    res.redirect("/success");
  } catch (error) {
    console.error(
      "Error exchanging authorization code for access token:",
      error
    );
    res.status(500).send("Internal server error");
  }
};

const outlookCallbackController = async (req, res) => {
  const authCode = req.query.code;
  try {
    const token = await acquireTokenO(authority, authCode);
    console.log(token);
    // const email=await getUserEmail(token);
  } catch (error) {}
};

module.exports = {
  registerGmailController,
  registerOutlookController,
  callbackController,
  outlookCallbackController,
};
