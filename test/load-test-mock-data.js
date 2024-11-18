import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter } from 'k6/metrics';

const accounts = [123456, 234567, 345678, 456789, 567890, 678901, 789012, 890123, 901234];
const ind_dc_values = ['D', 'C'];
const startDate = new Date('2024-11-01');
const endDate = new Date('2024-11-14');
const ENDPOINT_URI = 'localhost:3000';

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomValue(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// Carregue os usuários de um arquivo JSON ou defina-os diretamente no script
const users = new SharedArray('users', function() {
  return JSON.parse(open('./users.json')); // Carregue os usuários de um arquivo JSON
});

const successRequests = new Counter('success_requests');
const badRequests = new Counter('bad_requests');
const notFoundRequests = new Counter('not_found_requests');
const faultyRequests = new Counter('faulty_requests');
const ratelimitedRequests = new Counter('rate_limited_requests');
const timedOutRequests = new Counter('timed_out_requests');

// Estrutura de cache para armazenar tokens de login
const loginCache = {};

export let options = {
  stages: [
    { duration: '50s', target: 20000 }, // 100 usuários simultâneos em 1 minuto
    // { duration: '1m', target: 3000 },  // 3000 usuários simultâneos em 1 minuto
    // { duration: '1m', target: 100 },  // 100 usuários simultâneos em 1 minuto
  ],
};

export default function () {
   const token = null;

   // Gere valores randômicos para offset e limit
   const offset = Math.floor(Math.random() * 1000) + 0; // Offset de 0 até 1000
   const limit = Math.floor(Math.random() * 81) + 20; // Limit de 20 até 100

   // Recupera uma conta aleatória
   const account = accounts[Math.floor(Math.random() * accounts.length)];

   // Rota de listagem de registros
   apiRequest(token, 'GET', `http://${ENDPOINT_URI}/mock-data?offset=${offset}&limit=${limit}`, {});
   // Rota de sumário de registros por conta e período
   apiRequest(token, 'GET', `http://${ENDPOINT_URI}/mock-data/${account}/summary?period=month`, {});
   // Inserir novo registro
   apiRequest(token, 'POST', `http://${ENDPOINT_URI}/mock-data`, {}, getRamdonBody(account));
   // Rota de sumário de registros por conta e período
   apiRequest(token, 'GET', `http://${ENDPOINT_URI}/mock-data/${account}/summary?period=month`, {});
   sleep(0.5)
}

function getRamdonBody(account) {
  const description = `Transaction k6`;
  const date = getRandomDate(startDate, endDate);
  const ind_dc = ind_dc_values[Math.floor(Math.random() * ind_dc_values.length)];
  const value = getRandomValue(0.01, 1000.00);

  const body = {
    account: account,
    description: description,
    date: date,
    ind_dc: ind_dc,
    value: parseFloat(value),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return body;
}

function apiRequest(token, method, url, params = {}, body = null) {
  const parameters = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...params,
  };

  let res;
  if (method === 'GET') {
    res = http.get(url, parameters);
  } else if (method === 'POST') {
    res = http.post(url, body, parameters);
  } else if (method === 'PUT') {
    res = http.put(url, body, parameters);
  } else if (method === 'DELETE') {
    res = http.del(url, parameters);
  }

  // check(res, {
  //   'status is 200': (r) => r.status === 200,
  //   'status is 201': (r) => r.status === 201,
  //   'status is 400': (r) => r.status === 400,
  //   'status is 404': (r) => r.status === 404,
  //   'status is 408': (r) => r.status === 408,
  //   'status is 429': (r) => r.status === 429,
  //   'status is 500': (r) => r.status === 500,
  // });

  const statusCode = res.status;
  // console.log(statusCode);

  if (statusCode === 200 || statusCode === 201) {
    successRequests.add(1);
  } else if (statusCode === 400) {
    badRequests.add(1);
  } else if (statusCode === 404) {
    notFoundRequests.add(1);
  } else if (statusCode === 408) {
    timedOutRequests.add(1);
    // console.log('timedout', url);
  } else if (statusCode === 429) {
    ratelimitedRequests.add(1);
  } else {
    faultyRequests.add(1);
    // console.log('faulty', url);
    console.error('faulty_request', res.error);
  }

  return res;
}