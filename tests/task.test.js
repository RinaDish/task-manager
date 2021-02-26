const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app');
const {
  userOneId, userOne, setupDatabase, taskThree, userTwo,
} = require('./fixtures/db');

beforeEach(setupDatabase); // delete all users from test database, create one new user

test('Should create task for user', async (done) => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'From Jest Tests',
    })
    .expect(200);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBeFalsy();

  done();
});

test('Should fetch userOne`s tasks', async (done) => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body).toHaveLength(2);

  done();
});

test('Should not delete userTwo`s tasks', async (done) => {
  await request(app)
    .delete(`/tasks/${taskThree._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(404);

  const tasks = await Task.find({ owner: userTwo._id });

  expect(tasks).not.toBeNull();

  done();
});
