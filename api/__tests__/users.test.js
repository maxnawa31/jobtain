process.env.NODE_ENV = 'test';
const db = require('../db');
const request = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");


let auth = {}

beforeAll(async () => {
  //intialize users table
  await db.query("CREATE TABLE users (id SERIAL PRIMARY KEY, firstname TEXT, lastname TEXT, username TEXT, email TEXT, password TEXT)");
  await db.query("CREATE TABLE companies(id SERIAL PRIMARY KEY, name TEXT)");

  await request(app)
  .post("/comapnies")
  .send({
    name:"Facebook"
  })

  //sign up a new user
  await request(app)
    .post("/users")
    .send({
      firstname: "phil",
      lastname: "ivey",
      username: "iveyleague",
      email: "ivey@jobtain.com",
      password: "secret"
    });

    //Now log in that user
  const token = await request(app)
    .post("/users/login")
    .send({
      email: "ivey@jobtain.com",
      password: "secret"
    })
  auth['token'] = token.body.token;

  await request(app)
  .post("/users/1/applications")
  .set({
    "authorization":auth.token
  })
  .send({
    title:"Software Enginner",
    company:"Facebook",
    location:"Menlo Park"
  })
})

afterAll(async () => {
  await db.query("DROP TABLE users");
  db.end();
})


//test signing up a new user;
describe("POST /", () => {
  test("It signs up a new user", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        firstname: "Max",
        lastname: "Nawa",
        username: "maxnawa",
        email: "max@jobtain.com",
        password: "secret"
      });
    expect(response.body).toHaveProperty("id")
    expect(response.body).toHaveProperty("firstname")
    expect(response.body).toHaveProperty("lastname")
    expect(response.body).toHaveProperty("username")
    expect(response.body).toHaveProperty("email")
    expect(response.body).toHaveProperty("password")
  })

})

//test edit user without token

describe("PATCH /users/1", () => {
  test("It throws an error when a token is not provided", async () => {
    const response = await request(app)
    .patch("/users/1")
    .send({
      firstname: "phil",
      lastname: "ivey",
      username: "philIvey",
      email: "philIvey@jobtain.com",
      password: "secret"
    })
    let errObj = response.body.error;
    let message = errObj.message;
    expect(response.body).toHaveProperty("error");
    expect(errObj).toHaveProperty("message")
    expect(message).toBe("Unauthorized")
  })
});

describe("PATCH /users/1", () => {
  test("It successfully edits user when token is provided", async() => {
    const response = await request(app)
    .patch("/users/1")
    .set({"authorization":auth.token})
    .send({
      firstname: "phil",
      lastname: "ivey",
      username: "philIvey",
      email: "philIvey@jobtain.com",
      password: "secret"
    })
    let newUser = response.body;
    expect(newUser.username).toBe("philIvey")
    expect(newUser.email).toBe("philIvey@jobtain.com")
  })
})

// describe("POST /users/1/applications", () => {
//   test("It successfully adds an application", async() => {
//     const response = await request(app)
//     .post("/users/1/applications")
//     .set({
//       "authorization":auth.token
//     })
//     .send({
//       title:""
//     })
//   })
// })