const openai = require("openai");

const client =new openai({
  apiKey: "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",
});

async function categorizeContent(content) {
  try {
    const response = await client.chat.completions.create({
        model:"gpt-3.5-turbo",
        response_format:{ "type": "json_object" },
      prompt: `Categorize the following content:\n"${content}"\n\nCategory:\n the option are intrested,not intrested or know more`,
      maxTokens: 1,
      stop: ["\n"],
    });

    // Extract the categorized label from the response
    const label = response.data.choices[0].text.trim();

    return label;
  } catch (error) {
    console.error("Error categorizing content:", error);
    throw error;
  }
}

module.exports = { categorizeContent };
