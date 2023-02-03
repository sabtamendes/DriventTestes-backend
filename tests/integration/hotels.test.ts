import supertest from "supertest";
import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { createUser, findAllTicketsHasBeenPaid } from "../factories";
import { findHotels, findReservation } from "../factories/hotels-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);


describe("GET /hotels", () => {
  //NÃO TEM TOKEN
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  //TOKEN NÃO É VÁLIDO
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  //O TOKEN NÃO TEM SESSÃO
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  //RESPONSE QUANDO O TOKEN É VÁLIDO MAS NÃO TEM HOTEL

    it("should respond with empty array when there are no hotels", async () => {
      const token = await generateValidToken();
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(expect.arrayContaining([]));
    });
  

  //QUANDO NÃO TEM TICKET pago
  it("should respond with status 404 when user doesnt have a ticket yet", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await findAllTicketsHasBeenPaid(user.id);
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  //SE NÃO TIVER HOSPEDAGEM
  it("should respond with status 402 when user doesnt have a reservation yet", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await findReservation(user.id);
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
    expect(response.body).toEqual(expect.arrayContaining([]));
  });

  //QUNADO NÃO HÁ HOTEIS
  it("should respond with status 404 when no exist a hotel", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  // OK CASE // Responding with an array containing all hotels with paid ticket
  it("should return 200 status with hotels in the body", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.OK);

    const hotels = await findHotels();
    
    const expectedHotels = [{
      id: expect.any(Number),
      name: expect.any(String),
      image: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    }];

    expect(hotels).toEqual(expect.arrayContaining(expectedHotels));
  });
})


describe("GET /tickets/:hotelId", () => {
  //NÃO TEM TOKEN
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/tickets/:hotelId");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  //TOKEN NÃO É VÁLIDO
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/tickets/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  //O TOKEN NÃO TEM SESSÃO
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/tickets/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  //RESPONSE QUANDO O TOKEN É VÁLIDO
  describe("when token is valid", () => {
    it("should respond with empty array when there are no hotelId", async () => {
      const token = await generateValidToken();

      const response = await server.get("/tickets/:hotelId").set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual({});
    });
  })
})

