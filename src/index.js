if (process.env.NODE_ENV !== 'production') {
  const { default: dotenv } = await import('dotenv');
  dotenv.config();
  console.log('[ENV] .env loaded (dev)');
} else {
  console.log('[ENV] production env (Render panel)');
}

import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

(async () => {
  await initMongoConnection();
  setupServer();
})();
