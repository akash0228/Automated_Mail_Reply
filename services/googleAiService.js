const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function categorizeContent(content) {
  try {
    const prompt = `Categorize the following content:\n"${content}"\n\nCategory:\n the option are interested, not interested or know more jus reply Interested or Not Interested Or Know More, no extra word should be included`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const label = response.text();
    return label;
  } catch (error) {
    console.error("Error categorizing content:", error);
    throw error;
  }
}

async function generateReply(content,label) {
  try {
    const prompt = `create a reply for the customer of mine he is:\n${label}\n in my product and has sent email:\n${content}\n Ensure that the response doesn't contain any placeholders or variables, as it will be an automated email to the user.`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const reply = response.text();
    return reply;
  } catch (error) {
    console.error("Error categorizing content:", error);
    throw error;
  }
}

module.exports = { categorizeContent, generateReply };
