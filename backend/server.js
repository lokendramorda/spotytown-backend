require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();

// Security Middleware
app.use(helmet());
app.set('trust proxy', 1);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Schema Definition
const suggestionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  playlistUrl: {
    type: String,
    required: [true, 'Playlist URL is required'],
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  likes: { type: Number, default: 0, min: 0 },
  dislikes: { type: Number, default: 0, min: 0 },
  views: { type: Number, default: 0, min: 0 },
  userReactions: [{
    userId: { type: String, required: true },
    reaction: { type: String, enum: ['like', 'dislike'], required: true }
  }],
  viewIps: [String], // Track unique IPs for views
  createdAt: { type: Date, default: Date.now, index: { expires: '90d' } }
});

// Indexes
suggestionSchema.index({ createdAt: -1 });
suggestionSchema.index({ 'userReactions.userId': 1 });

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://spotytown.netlify.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
function sanitizeObject(obj) {
  for (let key in obj) {
    if (key.includes('$') || key.includes('.')) {
      delete obj[key];
    }
  }
}

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  // ❌ Skip req.query to avoid TypeError with read-only property
  next();
});




// Routes
app.post('/api/suggestions', apiLimiter, async (req, res) => {
  try {
    const { name, playlistUrl } = req.body;
    const newSuggestion = await Suggestion.create({ name, playlistUrl });
    res.status(201).json(newSuggestion);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/suggestions', apiLimiter, async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 }).limit(100);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/suggestions/:id/view', apiLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const userIp = req.ip;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const suggestion = await Suggestion.findById(id);
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    // Only count unique IPs
    if (!suggestion.viewIps.includes(userIp)) {
      suggestion.viewIps.push(userIp);
      suggestion.views += 1;
      await suggestion.save();
    }

    res.json({ views: suggestion.views });
  } catch (err) {
    console.error('View tracking error:', err);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

app.post('/api/suggestions/:id/react', apiLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;
    const userIp = req.ip;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (!['like', 'dislike'].includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const suggestion = await Suggestion.findById(id);
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    const existingIndex = suggestion.userReactions.findIndex(r => r.userId === userIp);
    
    if (existingIndex >= 0) {
      const existingReaction = suggestion.userReactions[existingIndex];
      
      // Remove previous reaction count
      if (existingReaction.reaction === 'like') suggestion.likes--;
      if (existingReaction.reaction === 'dislike') suggestion.dislikes--;

      // If same reaction clicked, remove it
      if (existingReaction.reaction === reaction) {
        suggestion.userReactions.splice(existingIndex, 1);
      } else {
        // Update to new reaction
        suggestion.userReactions[existingIndex].reaction = reaction;
        if (reaction === 'like') suggestion.likes++;
        if (reaction === 'dislike') suggestion.dislikes++;
      }
    } else {
      // Add new reaction
      suggestion.userReactions.push({ userId: userIp, reaction });
      if (reaction === 'like') suggestion.likes++;
      if (reaction === 'dislike') suggestion.dislikes++;
    }

    await suggestion.save();
    res.json({
      likes: suggestion.likes,
      dislikes: suggestion.dislikes,
      userReaction: suggestion.userReactions.find(r => r.userId === userIp)?.reaction || null
    });
  } catch (err) {
    console.error('Reaction error:', err);
    res.status(500).json({ error: 'Failed to save reaction' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
