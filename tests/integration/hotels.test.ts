import supertest from "supertest";
import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { cleanDb, generateValidToken  } from "../helpers";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import {  
  createEnrollmentWithAddress,
   createTicket, 
   createTicketType, 
   createUser, 
   findHotelById, 
   findHotels } from "../factories";
import { TicketStatus } from "@prisma/client";

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
    const invalidToken = faker.lorem.word();
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${invalidToken}`);
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

  //VALIDAÇÕES COM TOKEN VÁLIDO
  describe("when token is valid", () => {
    //quando o usuário não tem cadastro
    it("should respond with status 404 when there is no enrollment for given user", async () => {
      const token = await generateValidToken();
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status)
        .toBe(httpStatus.NOT_FOUND);
    });

    //quando usuário não tem reserva no hotel
      it("should respond with status 404 when there is no booking", async () => {
        const token = await generateValidToken();
        const response = await server
          .get("/hotels")
          .set("Authorization", `Bearer ${token}`);
        expect(response.status)
          .toBe(httpStatus.NOT_FOUND);
      });

      //se usuário não tem ticket
      it("should respond with status 404 when user doesnt have a ticket yet", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const response = await server
          .get("/hotels")
          .set("Authorization", `Bearer ${token}`);
        expect(response.status)
          .toEqual(httpStatus.NOT_FOUND);
      });

      //se ticket ainda não foi pago ou não inclui hotel ou o tipo do ticket é remoto
      it("should respond with status 402 when ticket has not paid yet", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        if (ticket.status === "RESERVED" || ticketType.isRemote === true || ticketType.includesHotel === false) {
          const response = await server
            .get("/hotels")
            .set("Authorization", `Bearer ${token}`);
          expect(response.status)
            .toEqual(httpStatus.PAYMENT_REQUIRED);
        }
      }); 
  
      //se não existe hotel
      it("should respond with status 404 when doesnt have a hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await findHotels();
        const response = await server
          .get("/hotels")
          .set("Authorization", `Bearer ${token}`);
        expect(response.status)
          .toEqual(httpStatus.NOT_FOUND);



          //falta o caso sucesso da rsponse
      });
    });
  });


// describe("GET /hotels/:hotelId", () => {
// });

