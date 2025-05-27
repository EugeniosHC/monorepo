const bcrypt = require('bcrypt');

async function hashPassword(plainTextPassword: string) {
  const saltRounds = 10; // deve bater com o que usas na app
  const hashed = await bcrypt.hash(plainTextPassword, saltRounds);
  console.log('Hashed password:', hashed);
}

hashPassword('Daniela4eugenios');
