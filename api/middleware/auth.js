const jwt = require('jsonwebtoken');
require('dotenv').load();
exports.ensureCorrectUser = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
      if (decoded && decoded.id === parseInt(req.params.id)) {
        return next();
      } else {
        return next({
          status: 401,
          message: "Unauthorized"
        })
      }
    })
  } catch (err) {
    return next({
      status: 401,
      message: "Unauthorized"
    })
  }
}