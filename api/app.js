const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userRoutes = require("./routes/users");
const companyRoutes = require('./routes/companies')
const morgan = require("morgan");
const errorHandler = require('./db/handlers/error');

require("dotenv").config();

const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(morgan("tiny"));
app.use("/users", userRoutes);
app.use("/companies", companyRoutes)
app.use(function (req, res, next) {
  let err = new Error("Not found");
  err.status = 404;
  next(err);
})

app.use(errorHandler)

app.listen(PORT, function () {
  console.log(`LISTENING ON PORT ${PORT}`)
})

module.exports = app;