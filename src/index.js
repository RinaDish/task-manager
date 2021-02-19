const express = require("express");
require("./db/mongoose");
const User = require("./models/user");
const Task = require("./models/task");
const isValidOperations = require("./utils");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/users", async (req, res) => {
  const user = new User(req.body);

  // user
  //   .save()
  //   .then(() => res.send(user))
  //   .catch((error) => res.status(400).send(error));

  try {
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get("/users", async (req, res) => {
  // User.find({})
  //   .then((users) => {
  //     res.send(users);
  //   })
  //   .catch((e) => {
  //     res.status(500).send();
  //   });

  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

app.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }

  // User.findById(_id)
  //   .then((user) => {
  //     if (!user) return res.status(404).send();
  //     res.send(user);
  //   })
  //   .catch((e) => {
  //     res.status(500).send;
  //   });
});

//Update User by ID
app.patch("/users/:id", async ({ params, body }, res) => {
  if (!isValidOperations(body, ["name", "email", "password", "age"]))
    return res.status(400).send({ error: "Invalid updates!" }); // Checking for allowed properties for updates (exp: not _id)

  try {
    const user = await User.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).send();
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});



app.post("/tasks", async (req, res) => {
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

app.get("/tasks", async (req, res) => {
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

app.get("/tasks/:id", async (req, res) => {
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
app.patch("/tasks/:id", async ({ params, body }, res) => {
  if (!isValidOperations(body, ["description", "completed"]))
    return res.status(400).send({ error: "Invalid updates!" }); // Checking for allowed properties for updates (exp: not _id)

  try {
    const task = await Task.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(400).send();
  }
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
