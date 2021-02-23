const isValidOperations = require("../utils");
const auth = require("../middleware/auth");
const User = require("../models/user");
const express = require("express");
const multer = require("multer");

const router = new express.Router();

router.post("/users", async (req, res) => {
  //create user (signup)
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
    const token = await user.generateAuthToken();
    return res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async ({ body }, res) => {
  try {
    const user = await User.findUserByCredentials(body.email, body.password); //statics method (for module)
    const token = await user.generateAuthToken(); //methods (for instance)
    return res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//close all sessions
router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//view my profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user); //user in req comes from auth middleware
});

//view all users` profiles
router.get("/users", auth, async (req, res) => {
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

//view smbd`s profile
router.get("/users/:id", auth, async (req, res) => {
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
router.patch("/users/me", auth, async ({ body, user }, res) => {
  const updates = Object.keys(body);
  if (!isValidOperations(updates, ["name", "email", "password", "age"]))
    return res.status(400).send({ error: "Invalid updates!" }); // Checking for allowed properties for updates (exp: not _id)

  try {
    updates.forEach((update) => (user[update] = body[update]));

    await user.save();

    if (!user) return res.status(404).send();
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

//delete profile
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) return res.status(404).send();

    await req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.status(500);
  }
});

const upload = multer({
  //ToDo: move to separate file
  dest: "avatars",
  limits: {
    fileSize: 1000000,
  },
  storage: multer.memoryStorage(), // it`s required for buffer field in the file
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(?:jpe?g|png)$/))
      return cb(new Error("Invalid file extention"));

    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth, //middleware for auth
  upload.single("avatar"), //middleware for upload
  async (req, res) => {
    req.user.avatar = req.file.buffer;
    console.log(req.file);
    await req.user.save();
    res.send();
  }, //success
  (error, req, res, next) => res.status(400).send({ error: error.message }) //error handling func
);

router.delete(
  "/users/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => res.status(400).send({ error: error.message })
);

//use url for <img> tag in html (src attribute)
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error();
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
