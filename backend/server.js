require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check for Vercel
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is reachable', timestamp: new Date() });
});

app.use('/api', routes);

// Add a base route for testing
app.get('/', (req, res) => {
  res.json({ status: 'Reta Aspis API is running' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
