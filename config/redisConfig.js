const Redis = require("ioredis");

const client = new Redis(
  13488,
  "redis-13488.c305.ap-south-1-1.ec2.cloud.redislabs.com",
  { password: "Rt3aekDRSkxTFtRHgf5lrlkM1F9nJsg0",
  maxRetriesPerRequest:null,
}
);

module.exports = client;
