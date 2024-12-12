// utils/prompts.js
function buildSystemPrompt(systemPrompt, businessDescription, personality, category) {
    if (!systemPrompt) return ""; // if no systemPrompt provided, return empty string
  
    return systemPrompt
      .replaceAll('$businessDescription', businessDescription || "")
      .replaceAll('$personality', personality || "")
      .replaceAll('$category', category || "");
  }
  
  module.exports = { buildSystemPrompt };
  