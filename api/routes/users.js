const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const SECRET = process.env.SECRET_KEY;
const { ensureCorrectUser } = require('../middleware/auth');

router.post("/login", async function(req,res,next) {
  try{
    const foundUser = await db.query(
      "SELECT * FROM users WHERE email=$1 LIMIT 1",
      [req.body.email]
    );
    if(foundUser.rows.length  === 0) {
      return res.json({message: "Invalid Email"})
    }
    const hashedPassword = await bcrypt.compare(
      req.body.password,
      foundUser.rows[0].password
    )
    if(hashedPassword === false) {
      return res.json({message: "Invalid Password"});
    }

    const token = jwt.sign(
      {id: foundUser.rows[0].id},
      SECRET,
      {
        expiresIn: 60 * 60
      }
    );
    return res.json({token})
  } catch(e) {
    return res.json(e)
  }
});




router.get("/", async function(req,res,next) {
  try{
    const results = await db.query("SELECT * FROM users");
    return res.json(results.rows);
  }catch(err) {
    return next(err);
  }
})

router.post("/", async function (req,res,next) {
  console.log(req.body)
  try{
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    const result = await db.query(
      "INSERT INTO users (firstname,lastname,username,email,password) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [req.body.firstname, req.body.lastname, req.body.username,req.body.email,hashedPassword]
    )
    return res.json(result.rows[0]);
  }catch(err) {
    console.log(err)
    if(err.code === '23505') {
      err.message = "This email is already taken."
    }
    return next({
      status: 500,
      message: err.message
    });
  }
})

router.patch('/:id',ensureCorrectUser, async function(req,res,next) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    const result = await db.query(
      `UPDATE users SET firstname=$1, lastname=$2, username=$3, email=$4, password=$5 WHERE id=$6 RETURNING *`,
      [req.body.firstname, req.body.lastname, req.body.username,req.body.email, hashedPassword, req.params.id]
    );
    return res.json(result.rows[0]);
  }catch(err) {
    return next(err);
  }
})


router.delete('/:id', ensureCorrectUser, async function(req,res,next) {
  try{
    const result = await db.query(
      "DELETE FROM users WHERE id=$1",
      [req.params.id]
    );
    return res.json({ message:"User deleted" })
  }catch(err) {
    return next(err);
  }
})


router.post('/:id/add-application', async function(req,res,next) {
  console.log(req.body.company)
  try{
    const company_id = await db.query(
      `SELECT id FROM Companies WHERE LOWER(Companies.name)=LOWER('${req.body.company}')`
    )
    const result = await db.query(
      "INSERT INTO APPLICATIONS (user_id,company_id,job_title,location) VALUES($1,$2,$3,$4) RETURNING *",
      [req.params.id, company_id.rows[0].id, req.body.title, req.body.location]
    )
    return res.json(result.rows[0]);
  }catch(err) {
    console.log(err)
    return next(err);
  }
})

//Get all applications for a specific user
router.get('/:id/applications', async function(req,res,next) {
  console.log("making query")
  try{
    const result = await db.query(
      `SELECT job_title,location,u.firstname,c.name FROM applications JOIN users u on applications.user_id=${req.params.id} AND u.id=${req.params.id} JOIN companies c ON c.id=applications.company_id`
    );
    return res.json(result.rows)
  }catch(err) {

  }
})



//SELECT u.firstname, c.name AS company_name, a.job_title, a.location FROM users u JOIN applications a ON u.id=a.user_id JOIN companies c ON a.company_id=c.id;




module.exports = router;


