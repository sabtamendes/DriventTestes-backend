
import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotel-service";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId as number;
  try {
    const hotel = await hotelsService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotel)
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST)
  }
}

export async function getHotelsById() {
  
}