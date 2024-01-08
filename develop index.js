const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 
const app = express();

app.use(cors());
app.use(express.json()); // for parsing application/json

mongoose.connect('mongodb+srv://peolr:passu@cluster0.ne2nivb.mongodb.net/myDatabase', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas...', err));

const eventSchema = new mongoose.Schema({
  title: String,
  start: Date,
  description: String,
  ketatulos: String, // new property
  starttime: String, // new property
});

const Event = mongoose.model('Event', eventSchema, 'calendarEvents');

const chatMessageSchema = new mongoose.Schema({
  eventId: String,
  sender: String,
  message: String,
  timestamp: Date,
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema, 'chatMessages');

app.post('/chatMessages', (req, res) => {
  const newChatMessage = new ChatMessage(req.body);

  newChatMessage.save()
    .then(() => res.json({ message: 'Chat message created successfully' }))
    .catch(err => {
      console.error('Error creating chat message:', err);
      res.status(500).json({ error: 'Error creating chat message' });
    });
});

app.get('/events', async (req, res) => {
  const events = await Event.find();
  res.send(events);
});

app.get('/chatMessages', async (req, res) => {
  try {
    const chatMessages = await ChatMessage.find();
    res.json(chatMessages);
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ error: 'Error fetching chat messages' });
  }
});

app.get('/events/:id', async (req, res) => {
  if (!req.params.id || req.params.id === 'undefined') return res.status(400).json({ error: 'Missing id parameter' });
  const id = req.params.id;
  const event = await Event.findOne({ _id: id });
  res.send(event); 
});

// Rest of your code...

const port = process.env.PORT || 80;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});