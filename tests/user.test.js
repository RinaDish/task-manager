const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user');
const app = require('../src/app');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Mike',
  email: 'mike@mail.com',
  password: '56qwertWe!',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.SECRET_SESSION),
  }],
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
  await request(app)
    .post('/users')
    .send({
      name: 'Janna',
      email: 'Jannasemail1@mail.com',
      password: 'Jannas2!',
    })
    .expect(201);
  done();
});

test('Should login existing user', async (done) => {
  await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  done();
});

test('Should not login existing user', async (done) => {
  await request(app)
    .post('/users/login')
    .send({
      email: badCreds.email,
      password: badCreds.password,
    })
    .expect(400);
  done();
});

test('Should get profile user', async (done) => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  done();
});

test('Should not get profile user', async (done) => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
  done();
});

test('Should delete user', async (done) => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  done();
});

test('Should not delete user', async (done) => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
  done();
});
