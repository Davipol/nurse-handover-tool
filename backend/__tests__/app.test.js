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

describe("GET /api/handovers", () => {
  test("200: returns all handovers when no filter is present", async () => {
    const { body } = await request(app).get("/api/handovers").expect(200);
    expect(body.handovers).toHaveLength(5);
    body.handovers.forEach((handover) => {
      expect(handover).toMatchObject({
        id: expect.any(Number),
        nurse_id: expect.any(Number),
        patient_id: expect.any(Number),
        handover_date: expect.any(String),
        shift: expect.any(String),
        urgency: expect.any(String),
        vitals: expect.any(Object),
        content: expect.any(String),
      });
      expect(handover.vitals).toMatchObject({
        bloodPressure: expect.any(String),
        pulse: expect.any(Number),
        temperature: expect.any(Number),
        respiratoryRate: expect.any(Number),
        oxygenSaturation: expect.any(Number),
      });
    });
  });
  test("200: returns all handovers with the same urgency when urgency filter is present", async () => {
    const { body } = await request(app)
      .get("/api/handovers?urgency=urgent")
      .expect(200);
    expect(body.handovers).toHaveLength(3);
    body.handovers.forEach((handover) => {
      expect(handover.urgency).toBe("urgent");
    });
  });
  test("200: returns all handovers with the same date when date filter is present", async () => {
    const { body } = await request(app)
      .get("/api/handovers?date=2026-02-02")
      .expect(200);
    expect(body.handovers).toHaveLength(3);
    body.handovers.forEach((handover) => {
      expect(handover.handover_date).toBe("2026-02-02T00:00:00.000Z");
    });
  });
  test("200: returns all handovers with the same shift when shift filter is present", async () => {
    const { body } = await request(app)
      .get("/api/handovers?shift=day")
      .expect(200);
    expect(body.handovers).toHaveLength(3);
    body.handovers.forEach((handover) => {
      expect(handover.shift).toBe("day");
    });
  });
  test("200: returns all correct handovers when two filters are present", async () => {
    const { body } = await request(app)
      .get("/api/handovers?urgency=urgent&shift=night")
      .expect(200);
    expect(body.handovers).toHaveLength(2);
    body.handovers.forEach((handover) => {
      expect(handover.shift).toBe("night");
      expect(handover.urgency).toBe("urgent");
    });
  });
  test("200: returns all correct handovers sorted in descending order when filter applied", async () => {
    const { body } = await request(app)
      .get("/api/handovers?urgency=urgent")
      .expect(200);
    expect(body.handovers).toBeSortedBy("handover_date", { descending: true });
  });
});
