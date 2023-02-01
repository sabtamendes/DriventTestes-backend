import { prisma } from "@/config";
import { Booking, Hotel, Room } from "@prisma/client";
import { array } from "joi";

async function findReservation(userId: number): Promise<Booking[]> {
  return await prisma.booking.findMany({ where: { userId } });
}

async function findHotels() {
  return await prisma.hotel.findMany();
}

async function findHotelById(hotelId: number) {
  return await prisma.hotel.findFirst({ where: { id: hotelId }, include: { "Rooms": true } });
}

const hotelRepository = {
  findReservation,
  findHotels,
  findHotelById
};
export default hotelRepository;
