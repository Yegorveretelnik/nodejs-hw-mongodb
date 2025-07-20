import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routes/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
function setupServer() {
  const app = express();
  app.use(cors());
  app.use(pino());

  app.use(express.json());

  console.log('Registering route: /contacts');
  app.use('/contacts', contactsRouter);
  app.use(errorHandler);
  app.use(notFoundHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { setupServer };
