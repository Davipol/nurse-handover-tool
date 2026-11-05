const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seed");
const testData = require("../db/data/test-data");

// Never call the real AI in tests: replace each function with a fake
jest.mock("../models/ai.model", () => ({
  summarizeHandovers: jest.fn().mockResolvedValue("Mock patient summary"),
  summarizeSingleHandover: jest.fn().mockResolvedValue("Mock single summary"),
  summarizeUnitDay: jest.fn().mockResolvedValue("Mock unit summary"),
}));

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/units", () => {
  test("200: responds with an array of all units", async () => {
    const { body } = await request(app).get("/api/units").expect(200);

    expect(body.units).toHaveLength(2);
    body.units.forEach((unit) => {
      expect(unit).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
      });
    });
  });
});

describe("GET /api/nurses", () => {
  test("200: responds with an array of all nurses", async () => {
    const { body } = await request(app).get("/api/nurses").expect(200);
    expect(body.nurses).toHaveLength(3);
    body.nurses.forEach((nurse) => {
      expect(nurse).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        unit_id: expect.any(Number),
      });
      expect(nurse).not.toHaveProperty("password_hash");
    });
  });
});

describe("POST /api/nurses/login", () => {
  test("200: responds with the correct nurse and does not show the password field", async () => {
    const { body } = await request(app)
      .post("/api/nurses/login")
      .send({
        email: "david@test.com",
        password: "Password1!",
      })
      .expect(200);
    expect(body).toMatchObject({
      id: 2,
      name: "David Kim",
      email: "david@test.com",
      unit_id: 1,
    });
    expect(body).not.toHaveProperty("password_hash");
  });
  test("401: responds with the correct error message if correct password but incorrect email address", async () => {
    const { body } = await request(app)
      .post("/api/nurses/login")
      .send({
        email: "unknown@email.com",
        password: "Password1!",
      })
      .expect(401);
    expect(body.msg).toBe("Invalid credentials");
  });
  test("401: responds with the correct error message if incorrect password is provided", async () => {
    const { body } = await request(app)
      .post("/api/nurses/login")
      .send({
        email: "david@test.com",
        password: "WrongPassword1!",
      })
      .expect(401);
    expect(body.msg).toBe("Invalid credentials");
  });
  test("400: responds with the correct error message if password or email not provided", async () => {
    const { body } = await request(app)
      .post("/api/nurses/login")
      .send({
        email: "",
        password: "WrongPassword1!",
      })
      .expect(400);
    expect(body.msg).toBe("Email and password are required");
  });
});
