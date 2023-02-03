import { prisma } from "@/config";
import { Booking, Hotel, TicketType } from "@prisma/client";

export async function findReservation(userId: number): Promise<Booking[]> {
  return await prisma.booking.findMany({ where: { userId } });
}

export async function findHotels():Promise<Hotel[]> {
  return await prisma.hotel.findMany();
}

async function findTicketTypeIsnRemote(isRemote: boolean): Promise<TicketType[]> {
  return await prisma.ticketType.findMany({ where: { isRemote } });
}