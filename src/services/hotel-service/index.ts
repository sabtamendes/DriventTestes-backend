import { notFoundError, requestError, unauthorizedError } from "@/errors";
import { paymentRequired } from "@/errors/auth-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  if (!userId) throw unauthorizedError();

  //se não tiver inscrição
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) throw notFoundError();

  //se não tiver ticket
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) throw notFoundError();
  
  //se ticket é remoto e se não existe hospedagem
  if(ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false) throw paymentRequired();
 
  //se não tiver efetuado o pagamento do ticket
  if(ticket.status === "RESERVED") throw paymentRequired();

  //se não existe hotel
  const hotel = await hotelRepository.findHotels();
  if(!hotel) throw notFoundError();

  return hotel;
}

async function getHotelsById(userId: number, hotelId: number) {
  if (!hotelId) throw requestError(400, "");

  if (!userId) throw unauthorizedError();
 
  //se não tiver inscrição
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) throw notFoundError();
  
  //se não tiver ticket
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) throw notFoundError();
  
  //se ticket é remoto e se não existe hospedagem
  if(ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false) throw paymentRequired();

  //se não tiver efetuado o pagamento do ticket
  if(ticket.status === "RESERVED") throw paymentRequired();
  
  //busca pelo hotel por id
  const hotel = await hotelRepository.findHotelById(hotelId);
  if (!hotel) throw notFoundError();

  return hotel;
}

const hotelsService = {
  getHotels,
  getHotelsById
};

export default hotelsService;
