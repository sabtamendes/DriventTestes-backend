import { prisma } from "@/config";
import { Enrollment } from "@prisma/client";

async function findAllHotel():Promise<Enrollment[]> {
  return await prisma.enrollment.findMany();
  //return await prisma.hotel.findMany();
}

const hotelRepository = {
  findAllHotel
}
export default hotelRepository