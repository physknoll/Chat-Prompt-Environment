# Bee Agent Chat 🐝💬

**A Node.js-powered web application that lets you configure a "Bee Agent" with customizable system prompts, personality, business description, category, and more.** 

With this project, you can:

- Start chat sessions with a custom AI persona using OpenAI’s GPT-4 model.
- Edit and display a system prompt that includes variables like `$businessDescription`, `$personality`, and `$category`.
- View, load, and delete previous chat sessions stored in MongoDB.
- Toggle textareas between expanded and collapsed states for easy viewing of long texts.
- Set up a dynamic UI that interacts seamlessly with a Node.js/Express backend, MongoDB Atlas, and the OpenAI API.

---

## Table of Contents

1. [Core Functionality 🎯](#core-functionality-)
   - [Starting a Session](#starting-a-session)
   - [Viewing & Editing the System Prompt](#viewing--editing-the-system-prompt)
   - [Adjusting Personality, Business Description, Category, and First Question](#adjusting-personality-business-description-category-and-first-question)
   - [Expanding & Collapsing Textareas](#expanding--collapsing-textareas)
   - [Session Management (Loading, Listing, Deleting)](#session-management-loading-listing-deleting)
   - [Communicating with OpenAI](#communicating-with-openai)
   
2. [Prompt System Explained 🤖](#prompt-system-explained-)
   - [Using Variables in Your Prompt](#using-variables-in-your-prompt)
   - [Example System Prompt](#example-system-prompt)

3. [Prerequisites & Requirements ⚙️](#prerequisites--requirements-️)

4. [Installing and Running the Project 🛠️](#installing-and-running-the-project-️)
   - [Clone Repository](#clone-repository)
   - [Install Dependencies](#install-dependencies)
   - [Environment Variables](#environment-variables)
   - [Run the Server](#run-the-server)

5. [File Structure 📁](#file-structure-)

6. [Detailed Code Snippets 📝](#detailed-code-snippets-)
   - [Backend: `server.js`](#backend-serverserverjs)
   - [Backend: `routes/sessionRoutes.js`](#backend-routessessionroutesjs)
   - [Backend: `routes/chatRoutes.js`](#backend-routeschatroutesjs)
   - [Backend: `models/Session.js`](#backend-modelssessionjs)
   - [Backend: `utils/prompts.js`](#backend-utilspromptsjs)
   - [Backend: `utils/openaiClient.js`](#backend-utilsopenaiclientjs)
   - [Frontend: `public/index.html`](#frontend-publicindexhtml)
   - [Frontend: `public/style.css`](#frontend-publicstylecss)
   - [Frontend: `public/script.js`](#frontend-publicscriptjs)
   - [Example `package.json`](#example-packagejson)

7. [Using the Application 👨‍💻](#using-the-application-)
   - [Starting a New Session](#starting-a-new-session)
   - [Viewing Previous Sessions](#viewing-previous-sessions)
   - [Deleting a Session](#deleting-a-session)
   - [Expanding and Collapsing Textareas](#expanding-and-collapsing-textareas)

8. [Tips & Best Practices 💡](#tips--best-practices-)

9. [Troubleshooting 🩺](#troubleshooting-)

---

## Core Functionality 🎯

**The Bee Agent Chat** allows you to define the entire persona and system prompt for your AI assistant. Through the front-end UI, you can:

1. **Start a Session**: Provide a **Business Description**, **Personality**, **Category**, **System Prompt**, and **First Question**. On clicking **"Start Session"**, a new chat session is created.
2. **View and Edit a System Prompt**: The system prompt is fully customizable. Variables like `$businessDescription`, `$personality`, and `$category` can be inserted directly into the prompt text.
3. **Manage Sessions**: See previously started sessions, load them, continue chatting, or delete them.
4. **Responsive Textareas**: Toggle between a small and large view to accommodate lengthy text.

### Starting a Session

- Input your business description, personality, category, system prompt, and a first question.
- Click **"Start Session"**.
- The first question appears in the chat history from the assistant without querying the LLM yet.

**Code Example (Front-End POST to `/start`):**

```javascript
const response = await fetch("/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    businessDescription,
    personality,
    category,
    systemPrompt,
    firstQuestion
  })
}).then(res => res.json());
```

### Viewing & Editing the System Prompt

A dedicated **System Prompt** textarea is included. Here you can enter the entire prompt that guides the AI’s behavior. Use `$businessDescription`, `$personality`, and `$category` placeholders to dynamically inject session-specific data.

**Example System Prompt Snippet:**

```text
You are a curious potential customer who wants to understand the business:
$businessDescription

Personality:
$personality

Category:
$category

You keep asking follow-up questions until all details are understood...
```

### Adjusting Personality, Business Description, Category, and First Question

These fields are directly editable from the left panel. On loading a saved session, these fields repopulate, allowing you to continue a conversation with the same context.

**Variables:**
- `$businessDescription`
- `$personality`
- `$category`

### Expanding & Collapsing Textareas

Each textarea (Business Description, Personality, System Prompt) has a **"Toggle Size"** button. By default, the textarea shows 3 rows. Clicking toggle changes it to 10 rows, offering a more comfortable view for long prompts.

**Code Example (JavaScript toggle logic):**

```javascript
function toggleTextareaSize(e) {
  const targetId = e.target.getAttribute('data-target');
  const textarea = document.getElementById(targetId);
  if (!textarea) return;
  textarea.rows = (textarea.rows === 3) ? 10 : 3;
}
```

### Session Management (Loading, Listing, Deleting)

**List Sessions**: The "Previous Sessions" panel lists sessions by timestamp and first question.

**Load Session**: Clicking a session loads its metadata and conversation into the UI.

**Delete Session**: A delete icon (🗑️) next to each session allows for removing it from the database.

**Code Example (Deleting Session):**

```javascript
async function deleteSession(sessionId) {
  if (!confirm("Are you sure you want to delete this session?")) return;
  const response = await fetch(`/session/${sessionId}`, { method: "DELETE" }).then(res => res.json());
  // Refresh session list after deletion
  fetchSessions();
}
```

### Communicating with OpenAI

User messages are sent to the back-end `/chat` route. The server constructs a message array including your `systemPrompt` (with variables replaced) and sends it to OpenAI’s `gpt-4` model. The reply is added to the session’s conversation in MongoDB and displayed in the UI.

---

## Prompt System Explained 🤖

The **System Prompt** is crucial. It defines the agent’s behavior, tone, and goals. By using placeholders in your prompt, you can dynamically adjust the personality based on the currently set **Business Description**, **Personality**, and **Category**.

### Using Variables in Your Prompt

- `$businessDescription`: Will be replaced by the text in the "Business Description" field.
- `$personality`: Will be replaced by the text in the "Personality" field.
- `$category`: Will be replaced by the text in the "Category" field.

**For Example:**

```text
You are now interacting with a business described as: $businessDescription
Your persona is: $personality
You focus on category: $category

Ask follow-up questions to fully understand their offerings...
```

When the session starts or resumes, these placeholders become the actual values you provided.

### Example System Prompt

```text
You are a curious potential customer who wants to fully understand the business described below.

Business Description: $businessDescription
Personality: $personality
Category: $category

You continuously ask clarifying and detailed follow-up questions based on previous answers...
```

---

## Prerequisites & Requirements ⚙️

**You need:**

- **Node.js** (v14+ recommended)
- **npm** (comes with Node)
- **MongoDB Atlas URI** (a free account and cluster can be set up at [mongodb.com](https://www.mongodb.com))
- **OpenAI API Key** (with access to GPT-4)
  
**Additional Dependencies:**

- **Express**: Web framework for Node.js.
- **Mongoose**: For MongoDB modeling.
- **OpenAI Node.js SDK**: For calling GPT-4 model.
- **dotenv**: For loading environment variables.
- **cors**: For handling cross-origin requests if needed.
- **uuid**: For generating unique session IDs.

---

## Installing and Running the Project 🛠️

### Clone Repository

```bash
git clone https://github.com/your-username/bee-agent-chat.git
cd bee-agent-chat
```

### Install Dependencies

```bash
npm install
```

This installs `express`, `mongoose`, `openai`, `dotenv`, `cors`, and `uuid`.

### Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://user:pass@yourcluster.mongodb.net/yourdb?retryWrites=true&w=majority
PORT=3000
```

**Note:** Replace the placeholders with your actual keys.

### Run the Server

```bash
npm run start
```

Open your browser at `http://localhost:3000`.

---

## File Structure 📁

```text
my-project/
  ├─ .env
  ├─ package.json
  ├─ server.js
  ├─ models/
  │   └─ Session.js
  ├─ routes/
  │   ├─ sessionRoutes.js
  │   └─ chatRoutes.js
  ├─ utils/
  │   ├─ openaiClient.js
  │   └─ prompts.js
  ├─ public/
  │   ├─ index.html
  │   ├─ style.css
  │   └─ script.js
```

---

## Detailed Code Snippets 📝

### Backend: `server.js`

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const sessionRoutes = require('./routes/sessionRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.use('/', sessionRoutes);
app.use('/', chatRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
  startServer();
}).catch(err => console.error("MongoDB connection error:", err));

function startServer() {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
```

### Backend: `routes/sessionRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

// List sessions
router.get('/sessions', async (req, res) => {
  const sessions = await Session.find({}, { sessionId: 1, timestamp: 1, firstQuestion: 1, _id: 0 }).sort({ timestamp: -1 });
  res.json({ sessions });
});

// Get a session
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findOne({ sessionId });
  if (!session) return res.json({ error: "Session not found" });

  const conversation = session.messages.map(m => (m.role === 'user')
    ? { userMessage: m.content }
    : { assistantMessage: m.content }
  );

  res.json({ session, conversation });
});

// Start a new session
router.post('/start', async (req, res) => {
  const { businessDescription, personality, category, systemPrompt, firstQuestion } = req.body;
  const newSessionId = uuidv4();

  const session = new Session({
    sessionId: newSessionId,
    businessDescription,
    personality,
    category,
    systemPrompt,
    firstQuestion,
    messages: [{ role: 'assistant', content: firstQuestion }]
  });
  await session.save();

  res.json({ sessionId: newSessionId, reply: firstQuestion });
});

// Delete a session
router.delete('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const result = await Session.deleteOne({ sessionId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Session not found or already deleted." });
  }
  res.json({ success: true });
});

module.exports = router;
```

### Backend: `routes/chatRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const openai = require('../utils/openaiClient');
const { buildSystemPrompt } = require('../utils/prompts');

router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  try {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.json({ error: "Session not found" });
    }

    session.messages.push({ role: 'user', content: message });
    await session.save();

    const finalSystemPrompt = buildSystemPrompt(
      session.systemPrompt,
      session.businessDescription,
      session.personality,
      session.category
    );

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
    session.messages.push({ role: 'assistant', content: assistantReply });
    await session.save();

    res.json({ reply: assistantReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get response from OpenAI." });
  }
});

module.exports = router;
```

### Backend: `models/Session.js`

```javascript
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
  systemPrompt: { type: String },
  firstQuestion: { type: String },
  timestamp: { type: Date, default: Date.now },
  messages: [MessageSchema]
});

module.exports = mongoose.model('Session', SessionSchema);
```

### Backend: `utils/prompts.js`

```javascript
function buildSystemPrompt(systemPrompt, businessDescription, personality, category) {
  if (!systemPrompt) return "";
  return systemPrompt
    .replaceAll('$businessDescription', businessDescription || "")
    .replaceAll('$personality', personality || "")
    .replaceAll('$category', category || "");
}

module.exports = { buildSystemPrompt };
```

### Backend: `utils/openaiClient.js`

```javascript
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

module.exports = openai;
```

### Frontend: `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Bee Agent Chat</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
      <div class="settings-panel">
          <h2>Settings</h2>

          <label>Business Description (use <code>$businessDescription</code>)</label>
          <div class="textarea-wrapper">
            <textarea id="business-description" placeholder="Describe your business..." rows="3"></textarea>
            <button class="toggle-size-btn" data-target="business-description">Toggle Size</button>
          </div>

          <label>Personality (use <code>$personality</code>)</label>
          <div class="textarea-wrapper">
            <textarea id="personality" placeholder="Describe the personality..." rows="3"></textarea>
            <button class="toggle-size-btn" data-target="personality">Toggle Size</button>
          </div>

          <label>Category (use <code>$category</code>)</label>
          <input type="text" id="category" placeholder="Enter category"/>

          <label>System Prompt</label>
          <div class="textarea-wrapper">
            <textarea id="system-prompt" placeholder="Full system prompt..." rows="3"></textarea>
            <button class="toggle-size-btn" data-target="system-prompt">Toggle Size</button>
          </div>

          <label>First Question</label>
          <input type="text" id="first-question" placeholder="First question..."/>

          <button id="start-session-btn">Start Session</button>

          <h2>Previous Sessions</h2>
          <div id="session-list" class="session-list"></div>
      </div>

      <div class="chat-container">
          <div id="chat-history" class="chat-history"></div>
          <div class="input-area">
              <input type="text" id="user-input" placeholder="Type your message..."/>
              <button id="send-btn">Send</button>
          </div>
      </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

### Frontend: `public/style.css`

*(As previously provided, with darker session items and toggle-size button styles.)*

### Frontend: `public/script.js`

*(As previously provided, with toggle size functionality and session management.)*

### Example `package.json`

```json
{
  "name": "bee-agent-chat",
  "version": "1.0.0",
  "description": "A Node.js backend to support a chat interface with GPT-4 and MongoDB storage",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "keywords": [
    "node",
    "express",
    "openai",
    "mongodb",
    "chatbot",
    "gpt-4"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mongoose": "^7.0.3",
    "openai": "^4.0.0",
    "uuid": "^9.0.0"
  }
}
```

---

## Using the Application 👨‍💻

### Starting a New Session

1. Enter a business description, personality, category, system prompt, and a first question.
2. Click **"Start Session"**.
3. The assistant’s first message (first question) appears in the chat.

### Viewing Previous Sessions

All previously created sessions appear under **"Previous Sessions"**. Clicking one loads its data and chat history.

### Deleting a Session

Click the delete (trash) icon to remove a session from MongoDB. Confirm the deletion, and the list updates.

### Expanding and Collapsing Textareas

Click **"Toggle Size"** next to any textarea to quickly switch between a compact (3-line) and expanded (10-line) view.

---

## Tips & Best Practices 💡

- **Be specific in your system prompt**: The more guidance you provide, the better the responses.
- **Keep track of your sessions**: Loaded sessions retain their prompt and configuration.
- **Use the toggle feature**: For long prompts or descriptions, toggle the textarea size to comfortably view/edit them.
- **Check your environment**: Ensure your `.env` variables are correct, especially `OPENAI_API_KEY` and `MONGODB_URI`.

---

## Troubleshooting 🩺

- **OpenAI API Errors**:  
  Double-check that you have the correct API key and model name (`"gpt-4"`).
- **MongoDB Connection Issues**:  
  Verify your `MONGODB_URI` and network access on MongoDB Atlas.
- **`TypeError` on Front-End**:  
  Make sure you haven’t mixed up file contents. The `server.js` file should not contain HTML or CSS.
- **No Responses from GPT-4**:  
  Confirm your OpenAI API is active and the model name is correct.

---

**Now you have a fully detailed `README.md`!** 🥳  
This document provides step-by-step guidance, code examples, and thorough explanations for every facet of the application.