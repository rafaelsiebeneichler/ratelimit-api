import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter } from 'k6/metrics';

// Carregue os usuários de um arquivo JSON ou defina-os diretamente no script
const users = new SharedArray('users', function() {
  return JSON.parse(open('./users.json')); // Carregue os usuários de um arquivo JSON
});

const allowedRequests = new Counter('rate_limit_allowed_requests', false);
const rateLimitedRequests = new Counter('rate_limit_blocked_requests', false);
// const faultyRequests = new Counter('faulty_requests', false);

// Estrutura de cache para armazenar tokens de login
const loginCache = {};

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // 10 usuários simultâneos em 30 segundos
    { duration: '1m', target: 20 },  // 20 usuários simultâneos em 1 minuto
    { duration: '30s', target: 3 },  // Reduza para 0 usuários em 30 segundos
  ],
};

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];
  const cacheKey = `${user.username}:${user.password}`;
  let token;

  // Verifique se o token está no cache e ainda é válido
  if (loginCache[cacheKey] && loginCache[cacheKey].expires > Date.now()) {
    token = loginCache[cacheKey].token;
  } else {
    // Faça a requisição de login se o token não estiver no cache ou estiver expirado
    const loginRes = http.post('http://localhost:3000/auth/login', JSON.stringify({
      username: user.username,
      password: user.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(loginRes, {
      'login successful': (r) => r.status === 200,
    });

    token = loginRes.json('access_token');

    // Armazene o token no cache com expiração de 60 segundos
    loginCache[cacheKey] = {
      token: token,
      expires: Date.now() + 600000, // 600 segundos
    };
  }

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  const res = http.get('http://localhost:3000/protected', params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'status is 429': (r) => r.status === 429,
  });

	const data = JSON.parse(res.body.toString());

	if (data.success) {
		allowedRequests.add(1);
	} else {
		rateLimitedRequests.add(1);
  }

  sleep(1);
}