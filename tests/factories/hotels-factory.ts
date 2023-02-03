import { prisma } from "@/config";
import { createUser } from "./users-factory";
import { Hotel, TicketType } from "@prisma/client";
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
export async function findHotels(): Promise<Hotel[]> {
  return await prisma.hotel.findMany();
}

async function findTicketTypeIsnRemote(isRemote: boolean): Promise<TicketType[]> {
  return await prisma.ticketType.findMany({ where: { isRemote } });
}
