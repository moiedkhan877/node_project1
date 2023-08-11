const mongoose = require("mongoose");

mongoose
    .connect("mongodb://127.0.0.1:27017/node_project1")
    .then(() => console.log("db connected dude"))
    .catch((err) => console.log(err));