process.env.NODE_ENV = 'test';
const db = require('../db');
const request = require("supertest");
const app = require("../app");

beforeAll(async () => {
  await db.query("CREATE TABLE users(id SERIAL PRIMARY KEY, firstname TEXT, lastname TEXT, username TEXT, email TEXT, password TEXT)")
})

beforeEach(async () => {
  // seed with some data
  await db.query("INSERT INTO users (firstname,lastname,username,email,password) VALUES ($1,$2,$3,$4,$5)",
["Max", "Nawa", "mnawa", "mnawa@jobtain.com", "jobtain"]);
});