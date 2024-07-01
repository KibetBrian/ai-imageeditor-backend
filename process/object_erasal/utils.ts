import Jimp from 'jimp';

// Function to make an image black and white
export const makeBlackAndWhite = async (image: Buffer): Promise<Buffer> => {
  const jimpImage = await Jimp.read(image);

  jimpImage.greyscale();
  
  return await jimpImage.getBufferAsync(Jimp.MIME_PNG);
};
