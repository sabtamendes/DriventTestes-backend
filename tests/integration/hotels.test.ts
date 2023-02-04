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
    it("should respond with status 402 when ticket has not paid yet, ticketType is remote and does not includes a hotel reservation", async () => {
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
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      const hotels = await findHotels();
      if(hotels.length === 0) {
        expect(response.status)
          .toEqual(httpStatus.NOT_FOUND);
      }
    });

    // caso sucesso da rsponse
    it("should respond with status 200 when the hotels exists in the database", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const result = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      const hotels = await findHotels();
      if(hotels.length > 0) {
        expect(result.status)
          .toBe(httpStatus.OK);
        expect(result.body)
          .toEqual(hotels);
      }
    });
  });
});

describe("GET /hotels/:hotelId", () => {
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

  //validações quandp Token é válido
  describe("when token is valid", () => {
    it("should respond with status 400 if query param hotelId is missing", async () => {
      const token = await generateValidToken();
      const response = await server
        .get("/hotels/:ticketId")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status)
        .toEqual(httpStatus.BAD_REQUEST);
    });

    //quando o usuário não tem cadastro
    it("should respond with status 404 when there is no enrollment for given user", async () => {
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
    it("should respond with status 402 when ticket has not paid yet, ticketType is remote and does not includes a hotel reservation", async () => {
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
    
    //caso onde hotel não existe
    it("should respond with status 404 when there is no hotel with the provided id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const invalidHotelId = "invalid-id";
      const result = await server
        .get(`/hotels?hotelId=${invalidHotelId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    
    //caso de sucesso
    it("should respond with status 200 when searching for a specific hotel by its id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotels = await findHotels();
      const hotelIds = hotels.filter(hotel => hotel.id);
      if (hotelIds.length > 0 && hotelIds[0].id) {
        const hotelId = hotelIds[0].id;
        const result = await server
          .get(`/hotels/${hotelId}`)
          .set("Authorization", `Bearer ${token}`);
        const hotel = await findHotelById(hotelId);
        expect(result.body).toEqual(expect.objectContaining({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [
            {
              id: hotel.Rooms[0].id,
              name: hotel.Rooms[0].name,
              capacity: hotel.Rooms[0].capacity,
              hotelId: hotel.Rooms[0].hotelId,
              createdAt: hotel.Rooms[0].createdAt.toISOString(),
              updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
            }
          ]
        }));
        expect(result.status).toBe(httpStatus.OK);
      } 
    });
  });
});

