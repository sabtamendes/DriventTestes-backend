import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotel-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId as number;

  try {
    const hotel = await hotelsService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotel);
  } catch (error) {
    return handleError(error, res);
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  const hotelId = Number(req.query.hotelId) as unknown as number;
  const userId = req.userId as number;
  try {
    const hotelRooms = await hotelsService.getHotelsById(userId, hotelId);

    return res.status(httpStatus.OK).send(hotelRooms);
  } catch (error) {
    return handleError(error, res);
  }
}

function handleError(error: Error, res: Response) {
  switch (error.name) {
  case "NotFoundError":
    return res.sendStatus(httpStatus.NOT_FOUND);
  case "UnauthorizedError":
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  case "PaymentRequired":
    return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  default:
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
