const request = require('supertest');
const app = require('../src/app');

test('Should signup a new user', async (done) => {
  await request(app).post('/users').send({
    name: 'Janna',
    email: 'Jannasemail1@mail.com',
    password: 'Jannas2!',
  }).expect(201);
  done();
});
