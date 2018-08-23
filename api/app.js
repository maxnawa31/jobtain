const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userRoutes = require("./routes/users");
const morgan = require("morgan");
const errorHandler = require('./db/handlers/error')
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(morgan("tiny"));
app.use("/users",userRoutes);

app.use(function(req,res,next) {
  let err = new Error("Not found");
  err.status = 404;
  next(err);
})

app.use(errorHandler)

app.listen(3000, function() {
  console.log("Server started on port 3000")
})