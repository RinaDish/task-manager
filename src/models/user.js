const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("./task");
require("dotenv").config();

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
        if (!validator.isEmail(value)) throw new Error("Email is invalid");
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(pass) {
        if (!validator.isStrongPassword(pass) || /pass?word/i.test(pass))
          throw new Error("Password is invalid");
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
  { timestamps: true }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.generateAuthToken = async function () {
  //methods (for instance)
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.SECRET_SESSION
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.statics.findUserByCredentials = async (email, pass) => {
  //statics method (for module)
  const user = await User.findOne({ email });
  if (!user) throw Error("Unknown user!");

  const isMatch = await bcrypt.compare(pass, user.password);
  if (!isMatch) throw Error("Incorrect password!");

  return user;
};

//Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password"))
    user.password = await bcrypt.hash(user.password, 10);

  next();
});

//delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
