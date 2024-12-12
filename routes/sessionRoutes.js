// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

// GET /sessions: list all sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({}, { sessionId: 1, timestamp: 1, firstQuestion: 1, _id: 0 }).sort({ timestamp: -1 });
    res.json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch sessions." });
  }
});

// GET /session/:sessionId: get a specific session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ sessionId });
    if (!session) return res.json({ error: "Session not found" });

    const conversation = session.messages.map(m => {
      if (m.role === 'user') {
        return { userMessage: m.content };
      } else {
        return { assistantMessage: m.content };
      }
    });

    res.json({ session, conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch session." });
  }
});

// POST /start: start a new session
router.post('/start', async (req, res) => {
  const { businessDescription, personality, category, systemPrompt, firstQuestion } = req.body;
  try {
    const newSessionId = uuidv4();
    // Create initial session with first assistant message
    const session = new Session({
      sessionId: newSessionId,
      businessDescription,
      personality,
      category,
      systemPrompt,
      firstQuestion,
      messages: [
        {
          role: 'assistant',
          content: firstQuestion
        }
      ]
    });
    await session.save();

    res.json({ sessionId: newSessionId, reply: firstQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to start session." });
  }
});

// DELETE /session/:sessionId: delete a session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await Session.deleteOne({ sessionId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Session not found or already deleted." });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete session." });
  }
});

module.exports = router;
