// src/config/email.config.ts

export default () => ({
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from:
      process.env.EMAIL_FROM || "Eugenio's Health Club <no-reply@eugenios.pt>",
    notification: process.env.NOTIFICATION_EMAIL || 'programacoes@eugenios.pt',
  },
});
