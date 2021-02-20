const express = require("express");
const Task = require("../models/task");
const User = require("../models/user");
const isValidOperations = require("../utils");

const router = new express.Router();

router.post("/tasks", async (req, res) => {
  //create task
  const task = new Task(req.body);

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

router.get("/tasks", async (req, res) => {
  // Task.find({})
  //   .then((tasks) => {
  //     res.send(tasks);
  //   })
  //   .catch((e) => {
  //     res.status(500).send();
  //   });

  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/tasks/:id", async (req, res) => {
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
    const task = await Task.findById(_id);
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Update Task by ID
router.patch("/tasks/:id", async ({ params, body }, res) => {
  const updates = Object.keys(body);
  if (!isValidOperations(updates, ["description", "completed"]))
    return res.status(400).send({ error: "Invalid updates!" }); // Checking for allowed properties for updates (exp: not _id)

  try {
    const task = await Task.findById(params.id);
    updates.forEach((update) => (task[update] = body[update]));

    await task.save();

    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", async ({ params }, res) => {
  try {
    const task = await Task.findByIdAndDelete(params.id);

    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500);
  }
});

module.exports = router;
