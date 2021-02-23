const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const isValidOperations = require("../utils");

const router = new express.Router();

//create task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  // task
  //   .save()
  //   .then(() => res.send(task))
  //   .catch((error) => res.status(400).send(error));

  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET /tasks?complited=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc(asc)
router.get("/tasks", auth, async ({ user, query }, res) => {
  const match = {};
  const sort = {};

  if (query.completed) match.completed = query.completed === "true";
  if (query.sortBy) {
    const parts = query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    // const tasks = await Task.find({ owner: user._id });  //first way
    await user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(query.limit),
          skip: parseInt(query.skip),
          sort,
        },
      })
      .execPopulate(); //second way
    res.send(user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  // Task.findById(_id)
  //   .then((task) => {
  //     if (!task) return res.status(404).send();
  //     res.send(task);
  //   })
  //   .catch((e) => {
  //     res.status(500).send;
  //   });

  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: req.user._id }); //possible to fetch only your own task
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Update Task by ID
router.patch("/tasks/:id", auth, async ({ user, params, body }, res) => {
  const updates = Object.keys(body);
  if (!isValidOperations(updates, ["description", "completed"]))
    return res.status(400).send({ error: "Invalid updates!" }); // Checking for allowed properties for updates (exp: not _id)

  try {
    const task = await Task.findOne({
      _id: params.id,
      owner: user._id,
    });
    if (!task) return res.status(404).send();

    updates.forEach((update) => (task[update] = body[update]));

    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async ({ user, params }, res) => {
  try {
    // const task = await Task.findByIdAndDelete(params.id);
    const task = await Task.findOneAndDelete({
      _id: params.id,
      owner: user._id,
    });

    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500);
  }
});

module.exports = router;
