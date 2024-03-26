const {
  registerGmailController,
  registerOutlookController,
  callbackController,
  outlookCallbackController,
} = require("../controller/registerController");

const router = require("express").Router();

router.get("/test", async (req, res) => {
  res.send("Hello");
});

router.get("/register-gmail", registerGmailController);

router.get("/register-outlook", registerOutlookController);

router.get("/auth/callback", callbackController);

router.get("/auth/outlookcallback", outlookCallbackController);

router.get("/success", (req, res) => {
  return res.send("SuccessFully Registered");
});

module.exports = router;
