import { AuthenticatedRequest } from "@/middlewares";
import paymentService from "@/services/payments-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketId = Number(req.query.ticketId);
    const { userId } = req;
   
    const payment = await paymentService.getPaymentByTicketId(userId,ticketId);

    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function paymentProcess(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const {
      ticketId,
      cardData,
    } = req.body;

    const payment = await paymentService.paymentProcess(ticketId, userId, cardData);

    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
