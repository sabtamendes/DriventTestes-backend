import supertest from "supertest";
import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { createEnrollmentWithAddress, createUser } from "../factories";
import { createReservation, createRoom, creatHotel, findHotels } from "../factories/hotels-factory";
import { Hotel } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  //quando o token não é enviado
  it("should respond with status 401 if no token is given", async () => {
    const response = await server
      .get("/hotels");
    expect(response.status)
      .toBe(httpStatus.UNAUTHORIZED);
  });

  //quando o token não é válido
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status)
      .toBe(httpStatus.UNAUTHORIZED);
  });

  //quando não há sessão ativa para o token
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status)
      .toBe(httpStatus.UNAUTHORIZED);
  });
});

// describe("GET /tickets/:hotelId", () => {
//   //NÃO TEM TOKEN
//   it("should respond with status 401 if no token is given", async () => {
//     const response = await server.get("/tickets/:hotelId");

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });
//   //TOKEN NÃO É VÁLIDO
//   it("should respond with status 401 if given token is not valid", async () => {
//     const token = faker.lorem.word();

//     const response = await server.get("/tickets/:hotelId").set("Authorization", `Bearer ${token}`);

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });
//   //O TOKEN NÃO TEM SESSÃO
//   it("should respond with status 401 if there is no session for given token", async () => {
//     const userWithoutSession = await createUser();
//     const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

//     const response = await server.get("/tickets/:hotelId").set("Authorization", `Bearer ${token}`);

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });
//   //RESPONSE QUANDO O TOKEN É VÁLIDO
//   describe("when token is valid", () => {
//     it("should respond with empty array when there are no hotelId", async () => {
//       const token = await generateValidToken();

//       const response = await server.get("/tickets/:hotelId").set("Authorization", `Bearer ${token}`);

//       expect(response.body).toEqual({});
//     });
//   })
// })

