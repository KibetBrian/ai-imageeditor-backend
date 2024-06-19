import {Request, Response, NextFunction} from 'express';
import { handleError } from '../../utils/utils';
import { StatusCodes } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { getImagePresignedUrl } from '../../utils/r2';
import prisma from '../../prisma/client';

export const getGeneratedImages = async(req:Request, res:Response, next:NextFunction)=>{
  try {
    
    const userId =new ObjectId('66544138aa3c1d8cb7479a67').toString();
    
    const imageKeys = await prisma.images.findMany({
      where:{
        userId
      },
      select:{
        key:true,
        createdAt:true
      },
      orderBy:{
        createdAt:'desc'
      },
      take:5
    });

    const imageUrlPromises = imageKeys.map((imageKey)=>{
      const imageUrl = getImagePresignedUrl({
        bucketName:'image-editor',
        key:imageKey.key
      });

      return imageUrl;
    });

    const imageUrls =  await  Promise.all(imageUrlPromises);

    const images = imageUrls.map((url, key)=>{

      return {
        createdAt:imageKeys[key].createdAt,
        url
      };
    });

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: images
    });
        
  } catch (e){
    handleError({
      error: e,
      functionName: 'getGeneratedImages',
      message: 'Error getting generated images',
      next
    });
  }
};