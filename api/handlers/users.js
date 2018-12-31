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
      'INSERT INTO users (firstname,lastname,username,email,password) VALUES ($1,$2,$3,$4,$5) RETURNING firstname,username,email', [firstname, lastname, username, email, hashedPassword]
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
      //user not found
      return next(new Error('Invalid Email or Password'))
    }
    const hashedPassword = await bcrypt.compare(
      password,
      foundUser.rows[0].password
    );
    if (hashedPassword === false) {
      //invalid password
      return next('Invalid Email or Password')
    }

    const token = jwt.sign({
        id: foundUser.rows[0].id
      },
      SECRET, {
        expiresIn: 60 * 60
      }
    );
    return res.json({
      token,
      id: foundUser.rows[0].id
    });
  } catch (err) {
    return next(err);
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
    location,
    status
  } = req.body;

  try {

    let result;
    //check if company already exists in database
    const company_id = await db.query(
      `SELECT id FROM Companies WHERE LOWER(Companies.name)=LOWER('${company}')`
    );

    // if company doesnt exist, add it
    if (company_id.rows.length === 0) {

      const new_company = await db.query("INSERT INTO companies (name) VALUES ($1) RETURNING id", [req.body.company])

      if (status !== '') {
        result = await db.query('INSERT INTO APPLICATIONS (user_id,company_id,job_title,location,status) VALUES($1,$2,$3,$4,$5) RETURNING *', [req.params.id, new_company.rows[0].id, title, location, status])
        //if status is not given
        return res.json(result.rows[0])
      } else {
        result = await db.query(
          'INSERT INTO APPLICATIONS (user_id,company_id,job_title,location) VALUES($1,$2,$3,$4) RETURNING *', [req.params.id, company_id.rows[0].id, title, location]
        );
        return res.json(result.rows[0])
      }

      //else if company exists already
    } else {

      //if status is given
      if (status !== '') {
        result = await db.query(
          'INSERT INTO APPLICATIONS (user_id,company_id,job_title,location,status) VALUES($1,$2,$3,$4,$5) RETURNING *', [req.params.id, company_id.rows[0].id, title, location, status]
        );
        return res.json(result.rows[0])
        //if status is not given
      } else {
        result = await db.query(
          'INSERT INTO APPLICATIONS (user_id,company_id,job_title,location) VALUES($1,$2,$3,$4) RETURNING *', [req.params.id, company_id.rows[0].id, title, location]
        );
        return res.json(result.rows[0])
      }

    }
    // return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function getAllApplications(req, res, next) {
  try {
    const result = await db.query(
      `SELECT applications.id,job_title AS title,location, status,timestamp, u.firstname,c.name AS company FROM applications JOIN users u on applications.user_id=${
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

async function getSingleApplication(req, res, next) {
  try {
    const job = await db.query(`SELECT company_id, job_title as title, location, status from APPLICATIONS WHERE id=${req.params.app_id}`)
    const companyId = job.rows[0]['company_id'];
    const company = await db.query(`SELECT name as company_name FROM companies WHERE id=${companyId}`);
    const result = { ...job.rows[0],
      ...company.rows[0]
    };
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}
module.exports = {
  signUpUser,
  loginUser,
  editUser,
  deleteUser,
  addApplication,
  getAllApplications,
  getSingleApplication
}