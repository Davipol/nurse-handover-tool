const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seed");
const testData = require("../db/data/test-data");
const aiModel = require("../models/ai.model");

// Never call the real AI in tests: replace each function with a fake
jest.mock("../models/ai.model", () => ({
  summarizeHandovers: jest.fn().mockResolvedValue("Mock patient summary"),
  summarizeSingleHandover: jest.fn().mockResolvedValue("Mock single summary"),
  summarizeUnitDay: jest.fn().mockResolvedValue("Mock unit summary"),
}));

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("Unknown routes", () => {
  test("404: responds with correct error message when a non-existent url is accessed", async () => {
    const { body } = await request(app).get("/api/nonexistent").expect(404);
    expect(body.msg).toBe("Route not found");
  });
});

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
  test("400: responds with Bad request when the date filter is not a valid date", async () => {
    const { body } = await request(app)
      .get("/api/handovers?date=not-a-date")
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });
  test("400: responds with Bad request when the date filter is an impossible date", async () => {
    const { body } = await request(app)
      .get("/api/handovers?date=2026-02-30")
      .expect(400);
    expect(body.msg).toBe("Bad request");
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
  test("200: includes voided handovers, with their void details, for traceability", async () => {
    const { body } = await request(app).get("/api/handovers").expect(200);

    const voidedNote = body.handovers.find((handover) => handover.is_voided);
    expect(voidedNote).toMatchObject({
      id: 4,
      is_voided: true,
      voided_by: 1,
      void_reason: "Wrong patient",
    });
  });
});

describe("POST /api/handovers", () => {
  const handover = {
    nurse_id: 1,
    patient_id: 4,
    handover_date: "2026-02-04",
    shift: "day",
    urgency: "routine",
    vitals: {
      bloodPressure: "120/80",
      pulse: 70,
      temperature: 36.5,
      respiratoryRate: 14,
      oxygenSaturation: 99,
    },
    content: "New note",
  };
  test("201: creates the note and returns it with an id", async () => {
    const { body } = await request(app)
      .post("/api/handovers")
      .send(handover)
      .expect(201);
    expect(body.handover).toMatchObject({
      ...handover,
      id: 6,
      handover_date: "2026-02-04T00:00:00.000Z",
    });
  });
  test("201: the new handover is saved in the database", async () => {
    await request(app).post("/api/handovers").send(handover).expect(201);

    const { body } = await request(app).get("/api/handovers").expect(200);
    expect(body.handovers).toHaveLength(6);
    expect(body.handovers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ content: "New note", patient_id: 4 }),
      ]),
    );
  });
  test("400: returns the correct message if one of the required fields is missing", async () => {
    const { body } = await request(app)
      .post("/api/handovers")
      .send({ ...handover, shift: "" })
      .expect(400);
    expect(body.msg).toBe("Missing required fields");
  });
  test("400: returns the correct message if one of the required enums fields is incorrect", async () => {
    const { body } = await request(app)
      .post("/api/handovers")
      .send({ ...handover, urgency: "wrongUrgency" })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });
  test("404: returns the correct message if one of the required fields is not found", async () => {
    const { body } = await request(app)
      .post("/api/handovers")
      .send({ ...handover, nurse_id: 999 })
      .expect(404);
    expect(body.msg).toBe("Not found");
  });
});
describe("PATCH /api/handovers/:id/urgency", () => {
  test("200: updates the urgency and returns the note with the new value", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/1/urgency")
      .send({ urgency: "critical" })
      .expect(200);
    expect(body.handover.urgency).toBe("critical");
    expect(body.handover.id).toBe(1);
  });
  test("400: returns the correct error message if no urgency is present", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/1/urgency")
      .send({})
      .expect(400);
    expect(body.msg).toBe("Only urgency can be updated");
  });
  test("404: returns the correct error message if an unknown handover id is specified", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/999/urgency")
      .send({ urgency: "critical" })
      .expect(404);
    expect(body.msg).toBe("Handover not found or already voided");
  });
  test("404: returns the correct error message if handover id was already voided", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/4/urgency")
      .send({ urgency: "critical" })
      .expect(404);
    expect(body.msg).toBe("Handover not found or already voided");
  });
  test("400: returns the correct error message if id is not a number", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/abc/urgency")
      .send({ urgency: "critical" })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });
  test("400: returns the correct error message if urgency is a wrong value", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/1/urgency")
      .send({ urgency: "wrong" })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });
});

describe("PATCH /api/handovers/:id/void", () => {
  test("200: returns a voided handover with correct fields", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/1/void")
      .send({ voided_by: 1, void_reason: "Test void" })
      .expect(200);
    expect(body.handover.id).toBe(1);
    expect(body.handover.is_voided).toBe(true);
    expect(body.handover.voided_by).toBe(1);
    expect(body.handover.void_reason).toBe("Test void");
    expect(typeof body.handover.voided_at).toBe("string");
  });
  test("400: returns the correct error message if no voided reason is present", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/1/void")
      .send({ voided_by: 1 })
      .expect(400);
    expect(body.msg).toBe("voided_by and void_reason are required");
  });
  test("404: returns the correct error message if handover id is not found", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/999/void")
      .send({ voided_by: 1, void_reason: "Test void" })
      .expect(404);
    expect(body.msg).toBe("Handover not found or already voided");
  });
  test("404: returns the correct error message if handover was already voided", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/4/void")
      .send({ voided_by: 1, void_reason: "Test void" })
      .expect(404);
    expect(body.msg).toBe("Handover not found or already voided");
  });
  test("404: returns the correct error message if voided_by nurse does not exist", async () => {
    const { body } = await request(app)
      .patch("/api/handovers/1/void")
      .send({ voided_by: 999, void_reason: "Test void" })
      .expect(404);
    expect(body.msg).toBe("Not found");
  });
});

describe("GET /api/patients", () => {
  test("200: responds with an array of all patients with correct fields", async () => {
    const { body } = await request(app).get("/api/patients").expect(200);
    expect(body.patients).toHaveLength(5);
    body.patients.forEach((patient) => {
      expect(patient).toMatchObject({
        id: expect.any(Number),
        first_name: expect.any(String),
        last_name: expect.any(String),
        date_of_birth: expect.any(String),
        bed: expect.any(String),
        status: expect.any(String),
        unit_id: expect.any(Number),
        ai_summary_count: expect.any(Number),
      });
      expect(
        patient.ai_summary === null || typeof patient.ai_summary === "string",
      ).toBe(true);
      expect(Array.isArray(patient.conditions)).toBe(true);
    });
  });
  test("200: returns all patients in the same unit when unit filter is present", async () => {
    const { body } = await request(app).get("/api/patients?unit=1").expect(200);
    expect(body.patients).toHaveLength(4);
    body.patients.forEach((patient) => {
      expect(patient.unit_id).toBe(1);
    });
  });
  test("200: returns the correct patient when bed filter is present", async () => {
    const { body } = await request(app)
      .get("/api/patients?bed=C-2")
      .expect(200);
    expect(body.patients).toHaveLength(1);
    expect(Array.isArray(body.patients)).toBe(true);
    expect(body.patients[0].bed).toBe("C-2");
  });
  test("200: filtered patients are sorted by bed", async () => {
    const { body } = await request(app).get("/api/patients?unit=1").expect(200);
    expect(body.patients).toBeSortedBy("bed");
  });
});

describe("GET /api/patients/:bed", () => {
  test("200: responds with the correct patient", async () => {
    const { body } = await request(app).get("/api/patients/C-1").expect(200);
    expect(body.patient).toMatchObject({
      id: 1,
      first_name: "John",
      last_name: "Smith",
      date_of_birth: "1965-03-15T00:00:00.000Z",
      bed: "C-1",
      conditions: ["Hypertension"],
      status: "admitted",
      unit_id: 1,
      ai_summary: "Cached summary for C-1",
      ai_summary_count: 2,
    });
  });
  test("404: responds with the correct message if no patient is in specified bed", async () => {
    const { body } = await request(app).get("/api/patients/R-99").expect(404);
    expect(body.msg).toBe("No patient found in this bed");
  });
});

describe("GET /api/patients/:bed/handovers", () => {
  test("200: responds with the correct handovers for the right patient", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-1/handovers")
      .expect(200);
    expect(body.handover_count).toBe(2);
    expect(body.handovers.length).toBe(2);
    expect(body.patient.first_name).toBe("John");
    expect(body.patient.id).toBe(1);
    body.handovers.forEach((handover) => {
      expect(handover.patient_id).toBe(1);
      expect(typeof handover.nurse_name).toBe("string");
    });
  });
  test("200: responds with the handovers sorted by date in descending order", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-1/handovers")
      .expect(200);
    expect(body.handovers).toBeSortedBy("handover_date", { descending: true });
  });
  test("200: shows who voided a note, and null for notes that aren't voided", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-2/handovers")
      .expect(200);

    const voidedNote = body.handovers.find((handover) => handover.is_voided);
    const activeNote = body.handovers.find((handover) => !handover.is_voided);

    expect(voidedNote.voided_by_name).toBe("Sarah Johnson");
    expect(activeNote.voided_by_name).toBeNull();
  });
  test("200: responds with an empty handovers array if patient has no handovers", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-3/handovers")
      .expect(200);
    expect(body.handovers.length).toBe(0);
    expect(body.handover_count).toBe(0);
  });
  test("404: responds with the correct message if the bed is not occupied", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-99/handovers")
      .expect(404);
    expect(body.msg).toBe("No patient found in this bed");
  });
});

describe("GET /api/patients/:bed/summary", () => {
  test("200: returns the cached summary when it is up to date, without calling the AI", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-1/summary")
      .expect(200);

    expect(body.ai_summary).toBe("Cached summary for C-1");
    expect(body.is_stale).toBe(false);
    expect(body.handover_count).toBe(2);
    expect(aiModel.summarizeHandovers).not.toHaveBeenCalled();
  });
  test("200: returns the old cached summary marked as stale, without calling the AI", async () => {
    const { body } = await request(app)
      .get("/api/patients/R-1/summary")
      .expect(200);

    expect(body.ai_summary).toBe("Old summary for R-1");
    expect(body.is_stale).toBe(true);
    expect(body.handover_count).toBe(1);
    expect(aiModel.summarizeHandovers).not.toHaveBeenCalled();
  });
  test("200: generates a new summary when there is no cache, calls the AI once and saves it", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-2/summary")
      .expect(200);

    expect(body.ai_summary).toBe("Mock patient summary");
    expect(body.is_stale).toBe(false);
    expect(body.handover_count).toBe(2);
    expect(aiModel.summarizeHandovers).toHaveBeenCalledTimes(1);

    // Check the new summary was saved to the patient
    const { body: patientBody } = await request(app)
      .get("/api/patients/C-2")
      .expect(200);

    expect(patientBody.patient.ai_summary).toBe("Mock patient summary");
    expect(patientBody.patient.ai_summary_count).toBe(2);
  });
  test("404: returns the correct message when the patient has no handovers, without calling the AI", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-3/summary")
      .expect(404);
    expect(body.msg).toBe("No handovers found for this patient");
    expect(aiModel.summarizeHandovers).not.toHaveBeenCalled();
  });
  test("404: returns the correct message when no patient is in the requested bed, without calling the AI", async () => {
    const { body } = await request(app)
      .get("/api/patients/C-999/summary")
      .expect(404);
    expect(body.msg).toBe("Patient not found");
    expect(aiModel.summarizeHandovers).not.toHaveBeenCalled();
  });
  test("500: responds with a generic error if the AI service fails", async () => {
    aiModel.summarizeHandovers.mockRejectedValueOnce(new Error("AI down"));

    const { body } = await request(app)
      .get("/api/patients/C-2/summary")
      .expect(500);

    expect(body.msg).toBe("Internal server error");
  });
});

describe("GET /api/handovers/:id/summary", () => {
  test("200: returns the right handover note, the mock summary and a disclaimer", async () => {
    const { body } = await request(app)
      .get("/api/handovers/1/summary")
      .expect(200);

    expect(body.handover_note.id).toBe(1);
    expect(body.ai_summary).toBe("Mock single summary");
    expect(body.disclaimer).toBe(
      "AI-generated summary - always verify with original note",
    );
    expect(aiModel.summarizeSingleHandover).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
    );
    expect(aiModel.summarizeSingleHandover).toHaveBeenCalledTimes(1);
  });
  test("404: responds with the correct message if handover does not exist", async () => {
    const { body } = await request(app)
      .get("/api/handovers/999/summary")
      .expect(404);
    expect(body.msg).toBe("Handover not found");
    expect(aiModel.summarizeSingleHandover).not.toHaveBeenCalled();
  });
  test("400: responds with the correct message if handover id is not a number", async () => {
    const { body } = await request(app)
      .get("/api/handovers/abctest/summary")
      .expect(400);
    expect(body.msg).toBe("Bad request");
    expect(aiModel.summarizeSingleHandover).not.toHaveBeenCalled();
  });
  test("500: responds with the correct error message when ai model is down", async () => {
    aiModel.summarizeSingleHandover.mockRejectedValueOnce(new Error("AI down"));
    const { body } = await request(app)
      .get("/api/handovers/1/summary")
      .expect(500);
    expect(body.msg).toBe("Internal server error");
  });
});

describe("GET /api/units/:id/summary", () => {
  test("200: responds with the correct unit, date, count and summary", async () => {
    const { body } = await request(app)
      .get("/api/units/1/summary?date=2026-02-01")
      .expect(200);
    expect(aiModel.summarizeUnitDay).toHaveBeenCalledTimes(1);
    expect(body.unit.id).toBe(1);
    expect(body.unit.name).toBe("Cardiology");
    expect(body.date).toBe("2026-02-01");
    expect(body.handover_count).toBe(1);
    expect(body.ai_summary).toBe("Mock unit summary");
  });
  test("400: responds with the correct message when date parameter is not present", async () => {
    const { body } = await request(app).get("/api/units/1/summary").expect(400);
    expect(body.msg).toBe("Date parameter is required (format: YYYY-MM-DD)");
    expect(aiModel.summarizeUnitDay).not.toHaveBeenCalled();
  });
  test("404: responds with the correct message when unit id is not found", async () => {
    const { body } = await request(app)
      .get("/api/units/999/summary?date=2026-02-01")
      .expect(404);
    expect(body.msg).toBe("Unit not found");
    expect(aiModel.summarizeUnitDay).not.toHaveBeenCalled();
  });
  test("404: responds with the correct message when no handover exists on the specified date", async () => {
    const { body } = await request(app)
      .get("/api/units/1/summary?date=2026-09-28")
      .expect(404);
    expect(body.msg).toBe("No handovers found for this unit on this date");
    expect(aiModel.summarizeUnitDay).not.toHaveBeenCalled();
  });
  test("200: responds with the summary of the existing notes, excluding the voided handover notes", async () => {
    const { body } = await request(app)
      .get("/api/units/1/summary?date=2026-02-02")
      .expect(200);
    expect(body.handover_count).toBe(2);
    expect(aiModel.summarizeUnitDay).toHaveBeenCalledTimes(1);
    const handoversSentToAI = aiModel.summarizeUnitDay.mock.calls[0][1];
    expect(handoversSentToAI).toHaveLength(2);
    handoversSentToAI.forEach((handover) => {
      expect(handover.is_voided).toBe(false);
    });
  });
});
