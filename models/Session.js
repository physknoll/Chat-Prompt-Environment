// models/Session.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  businessDescription: { type: String },
  personality: { type: String },
  category: { type: String },
  systemPrompt: { type: String }, // New field
  firstQuestion: { type: String },
  timestamp: { type: Date, default: Date.now },
  messages: [MessageSchema]
});

module.exports = mongoose.model('Session', SessionSchema);
