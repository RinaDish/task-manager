//CRUD

const { MongoClient, ObjectID } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

const id = new ObjectID();

MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error, client) => {
    if (error) {
      console.log("Unable to connect to database!");
    }
    const db = client.db(databaseName);

    {
      //
      // -- Find document (Read)
      //
      // db.collection('users').findOne({_id: new ObjectID('602d64737c29d448c8127343')}, (error, user) => {
      //     if (error) return console.log('Unable to fetch');
      //     console.log(user);
      // })
      //
      // -- Fetch multiple docs (toArray is coursor and takes a callback)
      //
      // db.collection('users').find({age: 24}).toArray((error, users) => {
      //     console.log(users);
      // })
      //
      // -- Get amount of finding docs
      //
      // db.collection('users').find({age: 24}).count((error, count) => {
      //     console.log(count);
      // })
      //
      // -- Add one new document (create)
      //
      // db.collection("users").insertOne(
      //   {
      //     _id: id,
      //     name: "neIra",
      //     age: 24,
      //   },
      //   (error, result) => {
      //     if (error) return console.log("Unable to insert user");
      //     console.log(result.ops);
      //   }
      // );
      //
      // -- Add many new document
      //
      // db.collection("users").insertMany([
      //   { name: "John", age: 13 },
      //   { name: "Gunther", age: 15 },
      // ], (error, result) =>  {
      //     if (error) return console.log('Unable to insert users');
      // });
      //
      // db.collection("tasks").insertMany(
      //   [
      //     { description: "todo smth", complited: true },
      //     { description: "add nothing", complited: false },
      //     { description: "create chaos", complited: false },
      //   ],
      //   (error, result) => {
      //     if (error) return console.log("Unable to insert tasks");
      //     console.log(result.ops);
      //   }
      // );
      //
      // db.collection('tasks').find({complited: false}).toArray((error, tasks) => {
      //     console.log(tasks);
      // })
      //
      // -- Update with promises ($inc, $set etc. keys for updating)
      //
      // db.collection("users")
      //   .updateOne(
      //     {
      //       _id: new ObjectID("602d307f23695446437f9584"),
      //     },
      //     {
      //       $inc: {
      //         age: 1,
      //       },
      //     }
      //   )
      //   .then((result) => console.log(result))
      //   .catch((error) => console.log(error));
      //
      //
      //
      // db.collection("tasks")
      //   .updateMany({ complited: false }, { $set: { complited: true } })
      //   .then((result) => console.log(result.modifiedCount))
      //   .catch((error) => console.log(error));
      //
      //Delete many
      //
      // db.collection("users")
      //   .deleteMany({
      //     age: 16,
      //   })
      //   .then((result) => console.log(result.deletedCount))
      //   .catch((error) => console.log(error));
    }

    db.collection("tasks")
      .deleteOne({ complited: true })
      .then((result) => console.log(result.deletedCount))
      .catch((error) => console.log(error));
  }
);
