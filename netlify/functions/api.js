const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const path = require('path');

// We need to require the routes and services from the backend folder
// When Netlify builds this, it should include these files
const routes = require('../../backend/routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Netlify functions are usually served at /.netlify/functions/api
// But our redirect maps /api/* to this function.
// So the request coming in will be /wardrobing, /fake-damage, etc.
app.use('/api', routes);
app.use('/', routes); 

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', source: 'netlify-function' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', source: 'netlify-function-api' }));

module.exports.handler = serverless(app);
