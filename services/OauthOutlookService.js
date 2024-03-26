const { ConfidentialClientApplication } = require("@azure/msal-node");
const dotenv = require("dotenv");
dotenv.config();

const clientId = process.env.CLIENTIDO;
const clientSecret = process.env.CLIENTSECRETO;
const redirectUri = process.env.REDIRECTURIO;

const createMSALClient = (authority) => {
  return new ConfidentialClientApplication({
    auth: {
      clientId: clientId,
      authority: authority,
      clientSecret: clientSecret,
    },
  });
};

const generateAuthUrlO = async (msalClient) => {
  const authCodeUrlParameters = {
    scopes: [
      "openid",
      "profile",
      "offline_access",
      "https://outlook.office.com/mail.readwrite",
    ],
    redirectUri,
  };

  try {
    const authUrl = await msalClient.getAuthCodeUrl(authCodeUrlParameters);
    return authUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const acquireTokenO = async (msalClient, code) => {
  const tokenRequest = {
    code: code,
    redirectUri,
    scopes: [
      "openid",
      "profile",
      "offline_access",
      "https://outlook.office.com/mail.readwrite",
    ],
  };

  try {
    const response = await msalClient.acquireTokenByCode(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const refreshTokenO = async (msalClient, refreshToken) => {
  const tokenRequest = {
    refreshToken: refreshToken,
    scopes: [
      "openid",
      "profile",
      "offline_access",
      "https://outlook.office.com/mail.readwrite",
    ],
  };

  try {
    const response = await msalClient.acquireTokenByRefreshToken(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserEmail = async (accessToken) => {
  try {
    const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.mail;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  createMSALClient,
  generateAuthUrlO,
  acquireTokenO,
  refreshTokenO,
  getUserEmail,
};
