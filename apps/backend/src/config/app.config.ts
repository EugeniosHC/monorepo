// src/config/app.config.ts

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  globalPrefix: 'api',
});
