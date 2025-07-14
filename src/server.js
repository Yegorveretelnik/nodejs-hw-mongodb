const express = require('express');
const cors = require('cors');
const pino = require('pino-http');

function setupServer() {
  const app = express();
  app.use(cors());
  app.use(pino());

  app.use(express.json());

  const contactsRouter = require('./routes/contactsRouter');
  app.use('/contacts', contactsRouter);

  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = { setupServer };
