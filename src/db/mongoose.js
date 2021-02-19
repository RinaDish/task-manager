const mongoose = require("mongoose");
const validator = require("validator");

mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});



// const smb = new User({
//   name: "   John",
//   age: 47,
//   email: "smb@gNail.com   ",
//   password: "djfehe!1Q",
// });

// smb
//   .save()
//   .then((sm) => console.log(sm))
//   .catch((error) => console.log(error));

// const Task = mongoose.model("Task", {
//   description: { type: String, required: true, trim: true },
//   completed: { type: Boolean, default: false },
// });

// const todo = new Task({ description: "create chaos   " });

// todo
//   .save()
//   .then((td) => console.log(td))
//   .catch((error) => console.log(error));
