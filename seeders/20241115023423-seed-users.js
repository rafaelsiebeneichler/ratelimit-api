// seeders/{timestamp}-seed-users.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      { username: 'user1', password: 'password1', createdAt: new Date(), updatedAt: new Date() },
      { username: 'user2', password: 'password2', createdAt: new Date(), updatedAt: new Date() },
      { username: 'user3', password: 'password3', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};