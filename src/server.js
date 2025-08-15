import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import contactsRouter from './routes/contacts.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
function setupServer() {
  const app = express();
  app.use(cookieParser());
  app.use(cors());
  app.use(pino());

  app.use(express.json());

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const swaggerPath = path.join(__dirname, '../docs/swagger.json');
  let swaggerDoc = {};
  try {
    if (fs.existsSync(swaggerPath)) {
      swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
    } else {
      console.warn(
        '[Swagger] docs/swagger.json not found. Run `npm run build-docs` to generate it.',
      );
    }
  } catch (e) {
    console.warn('[Swagger] Failed to load swagger.json:', e.message);
  }
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc || {}));
  app.get('/api-docs.json', (req, res) => res.sendFile(swaggerPath));

  app.get('/', (req, res) => {
    res.send('API is running');
  });

  console.log('Registering route: /contacts');
  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { setupServer };
