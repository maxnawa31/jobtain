const express = require('express');
const router = express.Router();
const {
  ensureCorrectUser
} = require('../middleware/auth');
const userHandlers = require('../handlers/users');

const {
  signUpUser,
  loginUser,
  editUser,
  deleteUser,
  addApplication,
  getAllApplications,
  getSingleApplication
} = userHandlers;

//sign up a user
router.post('/', signUpUser);

//Login  a user
router.post('/login', loginUser);

//edit user profile
router.patch('/:id', ensureCorrectUser, editUser);

//delete user profile
router.delete('/:id', ensureCorrectUser, deleteUser);

//add an application for a user
router.post('/:id/applications',ensureCorrectUser, addApplication);

//Get all applications for a specific user
router.get('/:id/applications', ensureCorrectUser, getAllApplications);

// router.get('/:id/applications/:app_id', ensureCorrectUser, getSingleApplication);

module.exports = router;