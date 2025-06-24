// src/config/ovg.config.ts

export default () => ({
  ovg: {
    baseUrl: process.env.OVG_EUGENIOS_URL,
    username: process.env.OVG_EUGENIOS_USERNAME,
    password: process.env.OVG_EUGENIOS_PASSWORD,
    timeout: parseInt(process.env.OVG_EUGENIOS_TIMEOUT ?? '5000', 10),
  },
});
