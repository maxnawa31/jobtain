const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
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
    return next(err);
  }
})

module.exports = router;