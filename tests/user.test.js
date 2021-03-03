const request = require('supertest');
const User = require('../src/models/user');
const app = require('../src/app');
const {
  userOneId, userOne, userTwoId, userTwo, badCreds, setupDatabase,
} = require('./fixtures/db');

beforeEach(setupDatabase); // delete all users from test database, create one new user

test('Should signup a new user', async (done) => {
  const { body } = await request(app)
    .post('/users')
    .send({
      name: 'Janna',
      email: 'Jannasemail1@mail.com',
      password: 'Jannas2!',
    })
    .expect(201);

  // Assert that db was changed correctly
  const user = await User.findById(body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the user from response
  expect(body)
    .toMatchObject({
      user:
      {
        name: 'Janna',
        email: 'jannasemail1@mail.com',
      },
      token: user.tokens[0].token,
    });

  expect(user.password).not.toBe('Jannas2!');
  done();
});

test('Should not signup a new user', async (done) => {
  const { body } = await request(app)
    .post('/users')
    .send({
      ...badCreds,
    })
    .expect(400);

  expect(body.errors.name).not.toBeUndefined();
  expect(body.errors.email).not.toBeUndefined();
  expect(body.errors.password).not.toBeUndefined();
  done();
});

test('Should login existing user', async (done) => {
  const { body } = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).not.toBeNull();

  expect(user.tokens[1].token).toMatch(body.token);
  done();
});

describe('Should not login', () => {
  test('Existing user', async (done) => {
    await request(app)
      .post('/users/login')
      .send({
        email: badCreds.email,
        password: badCreds.password,
      })
      .expect(404);
    done();
  });

  test('Non existing user', async (done) => {
    await request(app)
      .post('/users/login')
      .send({
        email: userOne.email,
        password: badCreds.password,
      })
      .expect(400);
    done();
  });
});

test('Should get profile user', async (done) => {
  const { body } = await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(body._id).toMatch(userOneId.toString());
  done();
});

test('Should not get profile user', async (done) => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
  done();
});

test('Should get profile user by id', async (done) => {
  const { body } = await request(app)
    .get(`/users/${userTwo._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(body._id).toMatch(userTwoId.toString());
  done();
});

describe('View user`s profile', () => {
  test('Should not get profile by id cause of unauthorization', async (done) => {
    await request(app)
      .get(`/users/${userTwo._id}`)
      .send()
      .expect(401);
    done();
  });

  test('Should not get profile by id cause of non existing user', async (done) => {
    await request(app)
      .get('/users/60377fc4a6f4490015b177e6')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(404);
    done();
  });
});

test('Should get all user', async (done) => {
  const { body } = await request(app)
    .get('/users')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(body).toHaveLength(2);
  done();
});

test('Should not get all user', async (done) => {
  await request(app)
    .get('/users')
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

  const user = await User.findById(userOneId);
  expect(user).toBeNull();

  done();
});

test('Should not delete user', async (done) => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);

  const user = await User.findById(userOneId);
  expect(user).not.toBeNull();
  done();
});

const uploadAvatar = async () => {
  const response = await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg');
  return response;
};

describe('Upload avatar', () => {
  test('Should not upload avatar image', async (done) => {
    await request(app)
      .post('/users/me/avatar')
      .attach('avatar', 'tests/fixtures/profile-pic.jpg')
      .expect(401);

    const user = await User.findById(userOneId);
    expect(user.avatar).toBeUndefined();
    done();
  });

  test('Should upload avatar image', async (done) => {
    const response = await uploadAvatar();
    expect(response.statusCode).toBe(200);

    const user = await User.findById(userOneId);
    // to check that avatar really was uploader
    expect(user.avatar).toEqual(expect.any(Buffer));
    done();
  });
});

describe('Delete avatar', () => {
  beforeEach(uploadAvatar);

  test('Should not delete avatar image', async (done) => {
    await request(app)
      .delete('/users/me/avatar')
      .expect(401);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
    done();
  });

  test('Should delete avatar image', async (done) => {
    await request(app)
      .delete('/users/me/avatar')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toBeUndefined();

    done();
  });
});

test('Should update user profile', async (done) => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'Helen' })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toMatch('Helen');

  done();
});

test('Should not update user profile', async (done) => {
  // Invalid props
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ location: 'Odessa' })
    .expect(400);

  // Unauthenticated user
  await request(app)
    .patch('/users/me')
    .send({ name: 'Olga' })
    .expect(401);

  const user = await User.findById(userOneId);
  expect(user.name).not.toMatch('Olga');

  done();
});

describe('Logout', () => {
  test('Should not logout cause of unauthorization', async (done) => {
    await request(app)
      .post('/users/logout')
      .send()
      .expect(401);

    const user = await User.findById(userOneId);
    const findToken = user.tokens.find(({ token }) => token === userOne.tokens[0].token);
    expect(findToken).not.toBeUndefined();
    done();
  });

  test('Should logout', async (done) => {
    await request(app)
      .post('/users/logout')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);

    const user = await User.findById(userOneId);
    const findToken = user.tokens.find(({ token }) => token === userOne.tokens[0].token);
    expect(findToken).toBeUndefined();
    done();
  });

  test('Should not close all sessions cause of unauthorization', async (done) => {
    await request(app)
      .post('/users/logoutall')
      .send()
      .expect(401);

    const user = await User.findById(userOneId);
    // const findToken = user.tokens.find(({ token }) => token === userOne.tokens[0].token);
    expect(user.tokens).not.toHaveLength(0);
    done();
  });

  test('Should close all sessions', async (done) => {
    await request(app)
      .post('/users/logoutall')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);

    const user = await User.findById(userOneId);
    // const findToken = user.tokens.find(({ token }) => token === userOne.tokens[0].token);
    expect(user.tokens).toHaveLength(0);
    done();
  });
});
