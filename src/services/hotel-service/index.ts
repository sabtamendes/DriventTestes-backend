import { notFoundError, unauthorizedError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Ticket, TicketStatus } from "@prisma/client";
import ticketService from "../tickets-service";

async function getHotels(userId: number) {

  //buscar hotel se ticket estiver pago
  //buscar hotel se estiver com hospedagem
  //provavelmente não é rota autenticada
  // se for rota autenticada if(!userId) throw unauthorizedError();

 const ticketHasAlreadyBeenPaid = await ticketRepository.findAllTicketsHasBeenPaid();

 if(ticketHasAlreadyBeenPaid.length === 0) throw notFoundError();

 const hotel = await hotelRepository.findAllHotel();

 return hotel;
}

const hotelsService = {
  getHotels
}

export default hotelsService;