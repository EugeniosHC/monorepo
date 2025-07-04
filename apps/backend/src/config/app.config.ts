// src/config/app.config.ts

export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  globalPrefix: 'api',
});
