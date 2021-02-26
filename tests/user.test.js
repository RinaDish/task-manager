const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const userOne = {
  name: 'Mike',
  email: 'mike@mail.com',
  password: '56qwertWe!',
};

const badCreds = {
  email: 'bademail@mail.com',
  password: '123Pass!!',
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should signup a new user', async (done) => {
  await request(app).post('/users').send({
    name: 'Janna',
    email: 'Jannasemail1@mail.com',
    password: 'Jannas2!',
  }).expect(201);
  done();
});

test('Should login existing user', async (done) => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password,
  }).expect(200);
  done();
});

test('Should login existing user', async (done) => {
  await request(app).post('/users/login').send({
    email: badCreds.email,
    password: badCreds.password,
  }).expect(400);
  done();
});
