const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config');
const initDatabase = require('./initDb');
const cors = require('cors');

const app = express();

const apiRouter = require('./app/routers');

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
}));

app.use(logger(config.logLevel));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/api', apiRouter);

// Initialize the database
initDatabase();

// start server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}, http://localhost:${config.port}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
