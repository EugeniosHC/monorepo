// src/config/email.config.ts

export default () => ({
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || 'danielaoliveira.fitnessup@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'azub dfjw ljdk zznw',
    from:
      process.env.EMAIL_FROM ||
      "Eugenio's Health Club <danielaoliveira.fitnessup@gmail.com>",
    notification: process.env.NOTIFICATION_EMAIL || 'programacoes@eugenios.pt',
  },
});
