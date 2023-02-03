import { prisma } from "@/config";
import { createUser } from "./users-factory";
import { Hotel } from "@prisma/client";
import faker from "@faker-js/faker";

export async function createReservation(userId: number, roomId: number) {
  const incomingUser = userId || (await createUser());
  return await prisma.booking.create({
    data: {
      userId: Number(incomingUser),
      roomId: roomId
    }
  });
}

export async function creatHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    }
  });
}

export async function createRoom(id: number, user: string) {
  return await prisma.room.create({
    data: {
      name: user,
      capacity: faker.datatype.number(),
      hotelId: id
    }

  });
}
export async function findHotels() {
  return await prisma.hotel.findMany();
}

export async function findHotelById(hotelId: number) {
  return await prisma.hotel.findFirst({ where: { id: hotelId }, include: { "Rooms": true } });
}

export async function findWithAddressByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

export async function findTicketByEnrollmentId(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true, //inner join
    }
  });
}
