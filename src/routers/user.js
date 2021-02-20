const express = require("express");
const User = require("../models/user");
const isValidOperations = require("../utils");

const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  //
  //The same parts of code with promises
  //
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

router.get("/users", async (req, res) => {
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

router.get("/users/:id", async (req, res) => {
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
router.patch("/users/:id", async ({ params, body }, res) => {
  const updates = Object.keys(body);
  if (!isValidOperations(updates, ["name", "email", "password", "age"]))
    return res.status(400).send({ error: "Invalid updates!" }); // Checking for allowed properties for updates (exp: not _id)

  try {
    const user = await User.findById(params.id);
    updates.forEach((update) => (user[update] = body[update]));

    await user.save();

    if (!user) return res.status(404).send();
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

router.delete("/users/:id", async ({ params }, res) => {
  try {
    const user = await User.findByIdAndDelete(params.id);

    if (!user) return res.status(404).send();
    res.send(user);
  } catch (e) {
    res.status(500);
  }
});

module.exports = router;
