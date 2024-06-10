import Jimp from "jimp";

export const validateAspectRatio= async(buffer:  Buffer)=>{

  const image = await Jimp.read(buffer);
  const {width, height} = image.bitmap;

  const aspectRatio = width/height;

  const longestSide = 2.5;

  const shortestSide = 1;

  return  aspectRatio >= shortestSide/longestSide && aspectRatio <= longestSide/shortestSide;
};