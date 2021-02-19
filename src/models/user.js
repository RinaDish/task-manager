const mongoose = require("mongoose");
const validator = require("validator");

const User = mongoose.model("User", {
  name: { type: String, required: true, trim: true },
  age: { type: Number, default: 0 },
  email: {
    type: String,
    required: true,
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
});

module.exports = User;
