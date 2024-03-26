const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const registerRouter = require("./routes/registerRoute");
const {
  processEmailsForAllUsers,
} = require("./services/EmailProcessingService");

const replyGenerationWorker = require("./tasks/replyGenerationWorker");
const replyWorker = require("./tasks/replyWorker");

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/", registerRouter);

processEmailsForAllUsers();
setInterval(processEmailsForAllUsers, 60000);

app.listen(PORT, () => {
  console.log("Server is running on Port:" + PORT);
});
