require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Add this line
const app = express();

app.use(cors());

// Declare the port variable once
const port = process.env.PORT || 3001;

app.use(express.json()); // for parsing application/json

mongoose.connect('mongodb+srv://peolr:passu@cluster0.ne2nivb.mongodb.net/myDatabase', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas...', err));

const eventSchema = new mongoose.Schema({
  title: String,
  start: Date,
  description: String,
  ketatulos: String,
  starttime: String, 
});

const Event = mongoose.model('Event', eventSchema, 'calendarEvents');

app.get('/events', async (req, res) => {
  const events = await Event.find();
  res.send(events);
});
app.get('/events/:id', async (req, res) => {
if (!req.params.id || req.params.id === 'undefined') return res.status(400).json({ error: 'Missing id parameter' });
  const id = req.params.id;
  const event = await Event.findOne({ _id: id });
  res.send(event); 
});
app.post('/events', (req, res) => {
  const { title, start, description, ketatulos, starttime } = req.body;
  const event = new Event({ title, start, description, ketatulos, starttime });

  console.log(`Received new event: ${title}, ${start}, ${description}, ${ketatulos}, ${starttime}`);

  event.save()
    .then((newEvent) => {
      console.log('Event saved to the database successfully: ', newEvent);
      res.status(200).json(newEvent);
    })
    .catch(err => {
      console.error('An error occurred while saving the event to the database:', err);
      res.status(500).json({ error: 'An error occurred while creating the event' });
    });
});
app.delete('/events/:id', async (req, res) => {
  if (!req.params.id || req.params.id === 'undefined') return res.status(400).json({ error: 'Missing id parameter' });

  const id = req.params.id;

  try {
    const event = await Event.findByIdAndDelete(id);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('An error occurred while deleting the event:', error);
    res.status(500).json({ error: 'An error occurred while deleting the event' });
  }
});
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/events/date/:date', async (req, res) => {
  const date = new Date(req.params.date);
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + 1);

  const events = await Event.find({
      start: {
          $gte: date,
          $lt: nextDate
      }
  });

  res.send(events);
});

app.put('/events/:id', async (req, res) => {
  const updatedEvent = req.body;
  try {
      const event = await Event.findByIdAndUpdate(req.params.id, updatedEvent, { new: true });
      res.json(event);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});