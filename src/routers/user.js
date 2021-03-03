const express = require('express');
const sharp = require('sharp');
const { isAllowedForModification } = require('../utils');
const auth = require('../middleware/auth');
const User = require('../models/user');
const { upload, successResponse, failureResponse } = require('../utils');

const router = new express.Router();

// create user (signup)
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();

    successResponse(res, { user, token }, 201);
  } catch (e) {
    failureResponse(res, e);
  }
});

router.post('/users/login', async ({ body }, res) => {
  try {
  // statics method (for model)
    const { user, error } = await User.findUserByCredentials(body.email, body.password);
    if (error) return failureResponse(res, { error }, 404);
    const token = await user.generateAuthToken(); // methods (for instance)

    return successResponse(res, { user, token });
  } catch (e) {
    return failureResponse(res, e);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token,
    );
    await req.user.save();

    successResponse(res);
  } catch (e) {
    failureResponse(res, e, 500);
  }
});

// close all sessions
router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    successResponse(res);
  } catch (e) {
    failureResponse(res, e, 500);
  }
});

// view my profile
router.get('/users/me', auth, async (req, res) => {
  try {
    successResponse(res, req.user); // user in req comes from auth middleware
  } catch (e) {
    failureResponse(res, e);
  }
});

// view all users` profiles
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({});

    successResponse(res, users);
  } catch (e) {
    failureResponse(res, e, 500);
  }
});

// view smbd`s profile
router.get('/users/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return failureResponse(res, { error: 'User not found' }, 404);

    return successResponse(res, user);
  } catch (e) {
    return failureResponse(res, e, 500);
  }
});

// Update my profile
router.patch('/users/me', auth, async ({ body, user }, res) => {
  const updates = Object.keys(body);

  // Checking for allowed properties for updates (e.g.: not _id)
  if (!isAllowedForModification(updates, ['name', 'email', 'password', 'age'])) return failureResponse(res, { error: 'Invalid updates!' });

  try {
    updates.forEach((update) => {
      (user[update] = body[update]);
    });
    await user.save();
    if (!user) return failureResponse(res, { error: 'User not found' }, 404);

    return successResponse(res, user);
  } catch (e) {
    return failureResponse(res, e);
  }
});

// delete profile
router.delete('/users/me', auth, async ({ user }, res) => {
  try {
    await user.remove();

    successResponse(res, user);
  } catch (e) {
    failureResponse(res, e, 500);
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

    successResponse(res);
  }, // success
  (error, req, res) => failureResponse(res, { error: error.message }),
  // error handling func (fourth arguments is next)
);

router.delete(
  '/users/me/avatar',
  auth,
  async ({ user }, res) => {
    try {
      user.avatar = undefined;
      await user.save();

      successResponse(res);
    } catch (e) { failureResponse(res, { error: e.message }); }
  },
);

// use url for <img> tag in html (src attribute)
router.get('/users/:id/avatar', async ({ params }, res) => {
  try {
    const user = await User.findById(params.id);
    if (!user || !user.avatar) throw new Error();
    res.set('Content-Type', 'image/png');

    successResponse(res, user.avatar);
  } catch (e) {
    failureResponse(res, e, 404);
  }
});

module.exports = router;
