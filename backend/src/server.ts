import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;

// Serve local frontend production build when running locally outside Vercel
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');
if (!process.env.VERCEL && fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor AcessoReal iniciado na porta ${PORT}`);
  console.log(`API disponivel em http://localhost:${PORT}/api`);
  console.log(`Aplicacao Web acessivel em http://localhost:${PORT}`);
});
