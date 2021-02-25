const validator = require('validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Task = require('./task');
require('dotenv').config();

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, default: 0 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error('Email is invalid');
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(pass) {
        if (!validator.isStrongPassword(pass) || /pass?word/i.test(pass)) throw new Error('Password is invalid');
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

// virtuals are docs props that you can get or set but that do not saved to DB
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

// methods (for instance)
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.SECRET_SESSION,
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// for non-showing unnecessary or secure data in response
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// statics method (for model)
userSchema.statics.findUserByCredentials = async (email, pass) => {
  const user = await User.findOne({ email });
  if (!user) throw Error('Unknown user!');

  const isMatch = await bcrypt.compare(pass, user.password);
  if (!isMatch) throw Error('Incorrect password!');

  return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 10);

  next();
});

// delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });

  next();
});

module.exports = User;
