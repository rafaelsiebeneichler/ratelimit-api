const fs = require('fs');
const path = require('path');

const accounts = [123456, 234567, 345678, 456789, 567890, 678901, 789012, 890123, 901234];
const ind_dc_values = ['D', 'C'];
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-11-14');

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomValue(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

const mockData = [];

for (let i = 1; i <= 200000; i++) {
  const account = accounts[Math.floor(Math.random() * accounts.length)];
  const description = `Transaction`;
  const date = getRandomDate(startDate, endDate);
  const ind_dc = ind_dc_values[Math.floor(Math.random() * ind_dc_values.length)];
  const value = getRandomValue(0.01, 1000.00);

  mockData.push({
    account: account,
    description: description,
    date: date,
    ind_dc: ind_dc,
    value: parseFloat(value),
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

const filePath = path.join(__dirname, '20241115025440-seed-mock-data.js');
const fileContent = `
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('MOCK_DATA', ${JSON.stringify(mockData, null, 2)}, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('MOCK_DATA', null, {});
  }
};
`;

fs.writeFileSync(filePath, fileContent, 'utf8');
console.log(`Seed file created at ${filePath}`);