import { notFoundError, requestError, unauthorizedError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  if (!userId) throw unauthorizedError();

  const ticketHasAlreadyBeenPaid = await ticketRepository.findAllTicketsHasBeenPaid(userId);

  if (ticketHasAlreadyBeenPaid.length === 0) throw notFoundError();

  const reservation = await hotelRepository.findReservation(userId);

  if (reservation.length === 0) throw notFoundError();

  const hotel = await hotelRepository.findHotels();

  return hotel;
}

async function getHotelsById(hotelId:number) {
  if(!hotelId) throw requestError(400, "");

  const hotel = await hotelRepository.findHotelById(hotelId);

  if(!hotel) throw notFoundError();

  return hotel;
}

const hotelsService = {
  getHotels,
  getHotelsById
};

export default hotelsService;
