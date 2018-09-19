const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET_KEY;


async function addQuestion (req,res,next) {
  const {
    job_title,
    phase,
    question,
    description
  } = req.body;
  let companyId = req.params.company_id;
  try {
    const result = await db.query(
      `INSERT INTO questions (company_id, job_title, question, description, phase) VALUES ($1, $2, $3, $4, $5) RETURNING *`,[companyId, job_title, question, description, phase]
    )
    return res.json(result.rows[0]);
  }catch(err) {
    return next(err);
  }
}

async function getAllQuestions(req,res,next) {
  let companyId = req.params.company_id;
  try {
    const result = await db.query(
      `SELECT job_title, question, description, phase from questions where company_id=${companyId}`
    )
    return res.json(result.rows);
  }catch(err) {
    return next(err);
  }
}

module.exports = {
  addQuestion,
  getAllQuestions
}