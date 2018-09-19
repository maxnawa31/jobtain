const express = require("express");
const router = express.Router();
const db = require("../db");
const companyHandlers = require('../handlers/companies');


const {
  addQuestion,
  getAllQuestions
} = companyHandlers;

router.post('/:company_id/questions', addQuestion);
router.get('/:company_id/questions', getAllQuestions);





module.exports = router;