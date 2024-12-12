require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const sessionRoutes = require('./routes/sessionRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve front-end files from "public"
app.use(express.static('public'));

// Routes
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
