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
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  const  hotelId  = Number(req.query.hotelId) as unknown as number;
  try {
    const hotelRooms = await hotelsService.getHotelsById(hotelId);

    return res.status(httpStatus.OK).send(hotelRooms);
    
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
