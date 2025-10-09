const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (public)
app.use(express.static('public'));

// API routes
app.use('/api', routes);

// health endpoint
app.get('/', (req, res) => res.send('CRM Backend API'));

// error handler
app.use(errorHandler);

module.exports = app;
