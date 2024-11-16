import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

// Estrutura de cache para armazenar tokens de login
const loginCache = {};

export const successRequests = new Counter('success_requests');
export const badRequests = new Counter('bad_requests');
export const notFoundRequests = new Counter('not_found_requests');
export const faultyRequests = new Counter('faulty_requests');
export const ratelimitedRequests = new Counter('rate_limited_requests');

export function login(user) {
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
      expires: Date.now() + 60000, // 60 segundos
    };
  }

  return token;
}

export function apiRequest(method, url, params = {}, body = null) {
  let res;
  if (method === 'GET') {
    res = http.get(url, params);
  } else if (method === 'POST') {
    res = http.post(url, body, params);
  } else if (method === 'PUT') {
    res = http.put(url, body, params);
  } else if (method === 'DELETE') {
    res = http.del(url, params);
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
    'status is 400': (r) => r.status === 400,
    'status is 404': (r) => r.status === 404,
    'status is 429': (r) => r.status === 429,
    'status is 500': (r) => r.status === 500,
  });

  const statusCode = res.status;
  console.log(statusCode);

  if (statusCode === 200) {
    successRequests.add(1);
  } else if (statusCode === 400) {
    badRequests.add(1);
  } else if (statusCode === 404) {
    notFoundRequests.add(1);
  } else if (statusCode === 429) {
    ratelimitedRequests.add(1);
  } else {
    faultyRequests.add(1);
  }

  return res;
}