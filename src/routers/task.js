const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const { isAllowedForModification, successResponse, failureResponse } = require('../utils');

const router = new express.Router();

// create task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    await task.save();

    successResponse(res, task);
  } catch (e) {
    failureResponse(res, e);
  }
});

// GET /tasks?complited=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc(asc)
router.get('/tasks', auth, async ({ user, query }, res) => {
  const match = {};
  const sort = {};

  if (query.completed) match.completed = query.completed === 'true';
  if (query.sortBy) {
    const parts = query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    // const tasks = await Task.find({ owner: user._id });  //first way
    await user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(query.limit, 10),
          skip: parseInt(query.skip, 10),
          sort,
        },
      })
      .execPopulate(); // second way

    successResponse(res, user.tasks);
  } catch (e) {
    failureResponse(res, e, 500);
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // possible to fetch only your own task
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return failureResponse(res, { error: 'Task not found' }, 404);

    return successResponse(res, task);
  } catch (e) {
    return failureResponse(res, e, 500);
  }
});

// Update Task by ID
router.patch('/tasks/:id', auth, async ({ user, params, body }, res) => {
  const updates = Object.keys(body);
  if (!isAllowedForModification(updates, ['description', 'completed'])) return failureResponse(res, { error: 'Invalid updates!' }); // Checking for allowed properties for updates (exp: not _id)

  try {
    const task = await Task.findOne({
      _id: params.id,
      owner: user._id,
    });
    if (!task) return failureResponse(res, { error: 'Task not found' }, 404);

    updates.forEach((update) => { (task[update] = body[update]); });
    await task.save();

    return successResponse(res, task);
  } catch (e) {
    return failureResponse(res, e);
  }
});

router.delete('/tasks/:id', auth, async ({ user, params }, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: params.id,
      owner: user._id,
    });

    if (!task) return failureResponse(res, { error: 'Task not found' }, 404);

    return successResponse(res, task);
  } catch (e) {
    return failureResponse(res, e, 500);
  }
});

module.exports = router;
