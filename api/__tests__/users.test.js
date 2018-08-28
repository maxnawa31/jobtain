process.env.NODE_ENV = 'test';
const db = require('../db');
const request = require("supertest");
const app = require("../app");

beforeAll(async () => {
  await db.query("CREATE TABLE users(id SERIAL PRIMARY KEY, firstname TEXT, lastname TEXT, username TEXT, email TEXT, password TEXT)")
})

beforeEach(async () => {
  // seed with some data
  await db.query("INSERT INTO users (firstname,lastname,username,email,password) VALUES ($1,$2,$3,$4,$5)", ["Max", "Nawa", "mnawa", "mnawa@jobtain.com", "jobtain"]);

});

afterEach(async () => {
  await db.query("DELETE FROM users")

})

afterAll(async () => {
  await db.query("DROP TABLE users");
  db.end();
})

describe("POST /users", async () => {
  test("It responds with newly created user", async () => {
    const newUser = await request(app)
      .post('/users')
      .send({
        firstname: "max",
        lastname: "nawa",
        username: "maxnawa",
        email: "maxnawa@maxnawa.com",
        password: "jobtain"
      })
    expect(newUser.body).toHaveProperty("id");
    expect(newUser.body).toHaveProperty("email")
    expect(newUser.body).toHaveProperty("username")
    expect(newUser.body).toHaveProperty("firstname")
    expect(newUser.body).toHaveProperty("lastname")
    expect(newUser.body).toHaveProperty("password")
    expect(newUser.statusCode).toBe(200);
    const response = await request(app)
      .get("/users")
    expect(response.body.length).toBe(2);
  })
})


describe("PATCH, /users/5", async () => {
  test("It responds with an updated user", async () => {
    const newUser = await request(app)
      .post("/users")
      .send({
        firstname: "max",
        lastname: "nawa",
        username: "maxnawa",
        email: "maxnawa@maxnawa.com",
        password: "jobtain"
      })
    const loggedInUser = await request(app)
      .post("/users/login")
      .send({
        email: "maxnawa@maxnawa.com",
        password: "jobtain"
      })
    const updatedUser = await request(app)
      .patch(`users/${loggedInUser.body.id}`)
      .set("authorization", loggedInUser.body.token)
      .send({
        firstname: "max",
        lastname: "nawa",
        username: "username updated",
        email: "email updated",
        password: "jobtain"
      })
    expect(updatedUser.body.username).toBe("username updated")
    expect(updatedUser.body.email).toBe("email updated")
  })
})