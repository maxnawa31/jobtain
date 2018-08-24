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

afterEach(async() => {
  await db.query("DELETE FROM users")
})

afterAll(async() => {
  await db.query("DROP TABLE users");
  db.end();
})

describe("GET /users", () => {
  test("It responds with an array of users", async() => {
    const response = await request(app).get("/users")
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("email")
    expect(response.body[0]).toHaveProperty("username")
    expect(response.body[0]).toHaveProperty("firstname")
    expect(response.body[0]).toHaveProperty("lastname")
    expect(response.body[0]).toHaveProperty("password")
    expect(response.statusCode).toBe(200);
  })
})

// describe("POST /users", () => {
//   test("It responds with newly created user", async() => {
//     const
//   })
// })