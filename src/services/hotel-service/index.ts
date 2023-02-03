import { notFoundError, requestError, unauthorizedError } from "@/errors";
import { paymentRequired } from "@/errors/auth-error";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  if (!userId) throw unauthorizedError();

  const ticketHasAlreadyBeenPaid = await ticketRepository.findAllTicketsHasBeenPaid(userId);

  const reservedTicket = ticketHasAlreadyBeenPaid.find((ticket) => ticket.status === "RESERVED");
  if (reservedTicket) throw paymentRequired();

  const ticket = ticketHasAlreadyBeenPaid;
  if (!ticket) throw notFoundError();

  const enrollment = ticket[0].enrollmentId;
  if (!enrollment) throw notFoundError();

  const isRemote = true;
  const ticketTypeIsRemote = await ticketRepository.findTicketTypeIsnRemote(isRemote);

  const isRemoteAndNotIncludesHotel = ticketTypeIsRemote.filter((ticketType) => ticketType.isRemote === true || ticketType.includesHotel === false);
  if (isRemoteAndNotIncludesHotel.length > 0) throw paymentRequired();


  const reservation = await hotelRepository.findReservation(userId);
  if (reservation.length === 0) throw paymentRequired();

  const hotel = await hotelRepository.findHotels();
  if (hotel.length === 0) throw notFoundError();
  return hotel;
}

async function getHotelsById(hotelId: number) {
  if (!hotelId) throw requestError(400, "");

  const hotel = await hotelRepository.findHotelById(hotelId);

  if (!hotel) throw notFoundError();

  return hotel;
}

const hotelsService = {
  getHotels,
  getHotelsById
};

export default hotelsService;
