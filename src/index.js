require('dotenv').config();
const { setupServer } = require('./server');
const { initMongoConnection } = require('./db/initMongoConnection');

(async () => {
  await initMongoConnection();
  setupServer();
})();
