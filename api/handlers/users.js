const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET_KEY;


async function signUpUser(req, res, next) {
  const {
    firstname,
    lastname,
    username,
    email,
    password
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (firstname,lastname,username,email,password) VALUES ($1,$2,$3,$4,$5) RETURNING *', [firstname, lastname, username, email, hashedPassword]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      err.message = 'This email is already taken.';
    }
    return next({
      status: 500,
      message: err.message
    });
  }
}

async function loginUser(req, res, next) {
  const {
    email,
    password
  } = req.body;
  try {
    const foundUser = await db.query(
      'SELECT * FROM users WHERE email=$1 LIMIT 1', [email]
    );
    if (foundUser.rows.length === 0) {
      return res.json({
        message: 'Invalid Email'
      });
    }
    const hashedPassword = await bcrypt.compare(
      password,
      foundUser.rows[0].password
    );
    if (hashedPassword === false) {
      return res.json({
        message: 'Invalid Password'
      });
    }

    const token = jwt.sign({
        id: foundUser.rows[0].id
      },
      SECRET, {
        expiresIn: 60 * 60
      }
    );
    return res.json({
      token
    });
    console.log(res.body)
  } catch (e) {
    return res.json(e);
  }
}

async function editUser(req, res, next) {
  const {
    firstname,
    lastname,
    username,
    email,
    password
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `UPDATE users SET firstname=$1, lastname=$2, username=$3, email=$4, password=$5 WHERE id=$6 RETURNING *`, [firstname, lastname, username, email, hashedPassword, req.params.id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const result = await db.query('DELETE FROM users WHERE id=$1', [
      req.params.id
    ]);
    return res.json({
      message: 'User deleted'
    });
  } catch (err) {
    return next(err);
  }
}

async function addApplication(req, res, next) {
  const {
    title,
    company,
    location
  } = req.body;

  try {
    let result;
    //check if company already exists in database
    const company_id = await db.query(
      `SELECT id FROM Companies WHERE LOWER(Companies.name)=LOWER('${company}')`
    );
    //if not add company
    if (company_id.rows.length === 0) {
      const new_company = await db.query("INSERT INTO companies (name) VALUES ($1) RETURNING id", [req.body.company])
      result = await db.query('INSERT INTO APPLICATIONS (user_id,company_id,job_title,location) VALUES($1,$2,$3,$4) RETURNING *', [req.params.id, new_company.rows[0].id, title, location])
    } else {
      result = await db.query(
        'INSERT INTO APPLICATIONS (user_id,company_id,job_title,location) VALUES($1,$2,$3,$4) RETURNING *', [req.params.id, company_id.rows[0].id, title, location]
      );
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function getAllApplications(req, res, next) {
  try {
    const result = await db.query(
      `SELECT job_title,location,u.firstname,c.name FROM applications JOIN users u on applications.user_id=${
        req.params.id
      } AND u.id=${
        req.params.id
      } JOIN companies c ON c.id=applications.company_id`
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  signUpUser,
  loginUser,
  editUser,
  deleteUser,
  addApplication,
  getAllApplications
};