import express from 'express';
import * as http from 'node:http';
import { telefunc, config } from 'telefunc';

import { configureSubscriber } from './src/backend/liveplay/updateSubscriber.js';
import { runMigrations } from './src/backend/db/db.js';

config.shield = { dev: true };

const port = process.env.PORT || 3000;

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules
const getRoot = async () => {
  const { dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const root = __dirname;
  return root;
};

const startServer = async () => {
  const app = express();
  const server = http.createServer(app);

  configureSubscriber(server);
  runMigrations();

  app.use(express.text());
  app.all('/_telefunc', async (req, res) => {
    const { originalUrl: url, method, body } = req;
    const httpResponse = await telefunc({
      url,
      method,
      body,
    });
    res
      .status(httpResponse.statusCode)
      .type(httpResponse.contentType)
      .send(httpResponse.body);
  });

  if (process.env.NODE_ENV === 'production') {
    const root = await getRoot();
    app.use(express.static(`${root}/dist/client`));
  } else {
    const vite = await import('vite');
    const viteDevMiddleware = (
      await vite.createServer({
        server: { middlewareMode: true },
      })
    ).middlewares;
    app.use(viteDevMiddleware);
  }

  server.listen(port);
};

startServer()
  .then(() => {
    console.log(`Server running at http://localhost:${port}`);
  })
  .catch(error => {
    console.error(error);
  });
