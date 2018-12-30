const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userRoutes = require("./routes/users");
const companyQuestions = require('./routes/companyQuestions')
const morgan = require("morgan");
const errorHandler = require('./db/handlers/error');
const cors = require('cors')


require("dotenv").config();

const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cors())
app.use(morgan("tiny"));
app.use("/users", userRoutes);
app.use("/companies/:company_id/questions", companyQuestions);
app.use(function (req, res, next) {
  let err = new Error("Not found");
  err.status = 404;
  next(err);
})
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
app.use(errorHandler);

module.exports = app;