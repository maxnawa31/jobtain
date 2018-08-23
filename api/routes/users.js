const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "askdfjsldkfjs";

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
    {email: foundUser.rows[0].email},
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
  try{
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    const result = await db.query(
      "INSERT INTO users (firstname,lastname,username,email,password) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [req.body.firstname, req.body.lastname, req.body.username,req.body.email,hashedPassword]
    )
    return res.json(result.rows[0])
  }catch(err) {
    if(err.code === '23505') {
      err.message = "This email is already taken."
    }
    return next({
      status: 500,
      message: err.message
    });
  }
})

module.exports = router;