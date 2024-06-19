import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../utils/utils";
import prisma from "../prisma/client";

export const syncAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, userId } = req.user;

    const user = await prisma.users.upsert({
      create:{
        email,
        name,
        userId
      },
      update:{
        email,
        name
      },
      where:{
        userId
      }
    });

    res.status(StatusCodes.OK).json({ message: 'User created', user });
  } catch (e) {
    handleError({
      error: e,
      functionName: 'signUp',
      message: 'Error in sign up function',
      next
    });
  }
};