const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connect = require('./conn/conn');
const router = require('./router/route');

const app = express();
const port = 8080;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // Reduce information leakage

// HTTP get request
app.get('/', (req, res) => {
  res.send('This is from server');
});

// API routes
app.use('/api', router);

// Start server and connect to the database
connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server connected to http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log('Cannot connect to the server:', error.message);
  });
