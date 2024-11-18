const fs = require('fs');
const crypto = require('crypto');

// Função para criptografar a senha usando MD5
function encryptPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

const users = [];

for (let i = 1; i <= 3000; i++) {
  const username = `user${i}`;
  const password = `password${i}`;
  const encryptedPassword = encryptPassword(password);

  users.push({
    userId: i,
    username: username,
    password: password,
  });
}

// Salvar os dados em um arquivo JSON
const filePath = 'users.json';
fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
console.log(`Arquivo ${filePath} criado com sucesso!`);