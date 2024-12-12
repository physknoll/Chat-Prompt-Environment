const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const configuration = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAI(configuration);

module.exports = openai;
