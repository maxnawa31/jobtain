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
  await db.query("CREATE TABLE companies (id SERIAL PRIMARY KEY, name TEXT)");
  await db.query("CREATE TYPE app_status AS ENUM ('Interested', 'Applied', 'Interview', 'Not A Fit', 'Accepted')")
  await db.query("CREATE TABLE applications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users (id) ON DELETE CASCADE, company_id INTEGER REFERENCES companies (id) ON DELETE CASCADE, job_title TEXT, location TEXT, status app_status)");
  await db.query("ALTER TABLE ONLY applications ALTER COLUMN status SET DEFAULT 'Interested' ");

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
      "authorization": auth.token
    })
    .send({
      title: "Software Enginner",
      company: "Facebook",
      location: "Menlo Park"
    })
})

afterAll(async () => {
  await db.query("DROP TABLE applications cascade");
  await db.query("DROP TABLE companies cascade");
  await db.query("DROP TABLE users cascade");
  await db.query("DROP TYPE app_status")
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

//test for editing user info
describe("PATCH /users/1", () => {
  test("It successfully edits user when token is provided", async () => {
    const response = await request(app)
      .patch("/users/1")
      .set({
        "authorization": auth.token
      })
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


//test for adding an application
//also test for if status is not provided
describe("POST /users/1/applications", () => {
  test("It successfully adds an application", async () => {
    const response = await request(app)
      .post("/users/1/applications")
      .set({
        "authorization": auth.token
      })
      .send({
        title: "Backend Engineer",
        company: "Facebook",
        location: "New York City"
      })
    let newApplication = response.body
    expect(newApplication.job_title).toBe("Backend Engineer")
    expect(newApplication.company_id).toBe(1)
    expect(newApplication.location).toBe("New York City")
    expect(newApplication.status).toBe("Interested")
  })
})

// test for when status is provided
describe("POST /users/1/applications", () => {
  test("It successfully adds an application", async () => {
    const response = await request(app)
      .post("/users/1/applications")
      .set({
        "authorization": auth.token
      })
      .send({
        title: "Frontend Engineer",
        company: "Facebook",
        location: "New York City",
        status: "Applied"
      })
    let newApplication = response.body
    expect(newApplication.job_title).toBe("Frontend Engineer")
    expect(newApplication.company_id).toBe(1)
    expect(newApplication.location).toBe("New York City")
    expect(newApplication.status).toBe("Applied")
  })
})

//test for getting all applications for a user
describe("GET /users/1/applications", () => {
  test("It successfully gets all of user's applications", async () => {
    const response = await request(app)
    .get("/users/1/applications")
    .set({
      "authorization" : auth.token
    })
    let allApplications = response.body;
    expect(allApplications).toHaveLength(2);
    expect(allApplications[0].title).toBe("Backend Engineer")
    expect(allApplications[1].title).toBe("Frontend Engineer")
  })
})