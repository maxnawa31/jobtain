const express = require("express");
const router = express.Router();
const db = require("../db");
const companyQuestionHandlers = require('../handlers/companyQuestions');


const {
  addQuestion,
  getOneQuestion,
  getAllQuestions
} = companyQuestionHandlers;

router.post('/', addQuestion);
router.get('/', getAllQuestions);
router.get('/:question_id', getOneQuestion);




module.exports = router;