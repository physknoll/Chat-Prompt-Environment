// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const openai = require('../utils/openaiClient');
const { buildSystemPrompt } = require('../utils/prompts');

// POST /chat: handle user message
router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.json({ error: "Session not found" });
    }

    // Add user message to session
    session.messages.push({ role: 'user', content: message });
    await session.save();

    // Build the system prompt based on user's input
    const finalSystemPrompt = buildSystemPrompt(
      session.systemPrompt,
      session.businessDescription,
      session.personality,
      session.category
    );

    // Construct the conversation for OpenAI
    const conversationMessages = [
      { role: "system", content: finalSystemPrompt },
      ...session.messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: conversationMessages,
      temperature: 0.7
    });

    const assistantReply = response.choices[0].message.content.trim();

    // Add assistant message to session
    session.messages.push({ role: 'assistant', content: assistantReply });
    await session.save();

    res.json({ reply: assistantReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get response from OpenAI." });
  }
});

module.exports = router;
