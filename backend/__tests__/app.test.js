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
