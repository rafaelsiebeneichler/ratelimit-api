const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');

// Função para criptografar a senha usando MD5
function encryptPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

async function getToken(username, password) {
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      username: username,
      password: password,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200 || response.status === 201) {
      return response.data.access_token;
    } else {
      console.error('Login failed:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

const users = [];

async function generateUsers() {
  const users = [];

  for (let i = 1; i <= 3000; i++) {
    const username = `user${i}`;
    const password = `password${i}`;
    const encryptedPassword = encryptPassword(password);

    // Obter o token para o usuário
    const token = await getToken(username, password);

    users.push({
      userId: i,
      username: username,
      password: password,
      token: token,
    });
  }

  // Salvar os dados em um arquivo JSON
  const filePath = 'users.json';
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
  console.log(`Arquivo ${filePath} criado com sucesso!`);
}

// Executar a função para gerar os usuários
generateUsers();