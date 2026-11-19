import app from './app.js';

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor AcessoReal iniciado na porta ${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}/api`);
    console.log(`🌐 Aplicação Web acessível em http://localhost:${PORT}`);
  });
}

export default app;
