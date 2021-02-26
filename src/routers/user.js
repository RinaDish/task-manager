const express = require('express');
const sharp = require('sharp');
const { isValidOperations } = require('../utils');
const auth = require('../middleware/auth');
const User = require('../models/user');
const { upload } = require('../utils');

const router = new express.Router();

// create user (signup)
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  const dbName = User.db.name;

  //
  // The same parts of code with promises
  //
  // user
  //   .save()
  //   .then(() => res.send(user))
  //   .catch((error) => res.status(400).send(error));

  try {
    await user.save();
    const token = await user.generateAuthToken();
    return res.status(201).send({ user, token, dbName });
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.post('/users/login', async ({ body }, res) => {
  try {
    // statics method (for module)
    const user = await User.findUserByCredentials(body.email, body.password);
    const token = await user.generateAuthToken(); // methods (for instance)
    return res.send({ user, token });
  } catch (e) {
    return res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token,
    );
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// close all sessions
router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// view my profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user); // user in req comes from auth middleware
});

// view all users` profiles
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

// view smbd`s profile
router.get('/users/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).send();

    return res.send(user);
  } catch (e) {
    return res.status(500).send();
  }
});

// Update my profile
router.patch('/users/me', auth, async ({ body, user }, res) => {
  const updates = Object.keys(body);

  // Checking for allowed properties for updates (e.g.: not _id)
  if (!isValidOperations(updates, ['name', 'email', 'password', 'age'])) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    updates.forEach((update) => {
      (user[update] = body[update]);
    });

    await user.save();

    if (!user) return res.status(404).send();
    return res.send(user);
  } catch (e) {
    return res.status(400).send();
  }
});

// delete profile
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.status(500);
  }
});

// upload avatar
router.post(
  '/users/me/avatar',
  auth, // middleware for auth
  upload.single('avatar'), // middleware for upload
  async (req, res) => {
    const buffer = await sharp(req.file.buffer) // to editting (normalize) images
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  }, // success
  (error, req, res) => res.status(400).send({ error: error.message }),
  // error handling func (fourth arguments is next)
);

router.delete(
  '/users/me/avatar',
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  },
  (error, req, res) => res.status(400).send({ error: error.message }), // (fourth arguments is next)
);

// use url for <img> tag in html (src attribute)
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error();
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
