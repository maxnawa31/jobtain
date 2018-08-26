const express = require("express");
const router = express.Router();
const db = require("../db");



router.post('/', async function(req,res,next) {
  try{
    const result = await db.query(
      "INSERT INTO companies (name) VALUES ($1) RETURNING *",
      [req.body.name]
    )
    return res.json(result.rows[0]);
  }catch(err) {
    if(err.code === '23505') {
      err.message= "Company already exists"
    }
    return next({
      status: 500,
      message: err.message
    })
  }
})







module.exports = router;