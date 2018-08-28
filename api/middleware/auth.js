const jwt = require('jsonwebtoken');
require('dotenv').load();
exports.ensureCorrectUser = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[0];
    const auth = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
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