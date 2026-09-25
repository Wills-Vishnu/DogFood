// Development only: forwards API and upload requests from the React dev server to the FastAPI backend,
// keeping the session cookie first-party just as nginx does in the Docker deployment.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware(['/api', '/uploads'], {
      target: process.env.DOGFOOD_API_URL || 'http://localhost:8000',
      changeOrigin: false,
    })
  );
};
