import express from 'express';
import { apiRouter } from './api.ts';
import type { PluginOption } from 'vite';

export function expressApiPlugin(): PluginOption {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiRouter);

  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use(app);
    },
  };
}
