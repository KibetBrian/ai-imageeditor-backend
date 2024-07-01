import sharp from 'sharp';

const maximumPixels = 4194304;
const minimumSideLength = 64;

export async function resizeImage(imageBinary:number[], maxPixels = maximumPixels, minSideLength = minimumSideLength) {
  const imageBuffer = Buffer.from(imageBinary);

  const metadata = await sharp(imageBuffer).metadata();
  const { width, height } = metadata;

  if (!width || !height){
    throw new Error('Image has no width or height');
  }
  const currentPixels = width * height;
  
  // Check if resizing is needed
  if (currentPixels <= maxPixels && width >= minSideLength && height >= minSideLength) {
    return imageBuffer;
  }
  
  let newWidth, newHeight;
  
  if (currentPixels > maxPixels) {
    // Downsize to fit max pixels
    const scaleFactor = Math.sqrt(maxPixels / currentPixels);
    newWidth = Math.floor(width * scaleFactor);
    newHeight = Math.floor(height * scaleFactor);
  } else {
    // Image is within max pixels, but might need upsizing for min side length
    newWidth = width;
    newHeight = height;
  }
  
  // Ensure minimum side length
  if (newWidth < minSideLength) {
    newWidth = minSideLength;
    newHeight = Math.floor(height * (minSideLength / width));
  }
  if (newHeight < minSideLength) {
    newHeight = minSideLength;
    newWidth = Math.floor(width * (minSideLength / height));
  }
  
  // Resize image
  const resizedBuffer = await sharp(imageBuffer)
    .resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: false // Allow enlargement for min side length
    })
    .toBuffer();
  
  // eslint-disable-next-line no-console
  console.log(`Image resized successfully. New dimensions: ${newWidth}x${newHeight}`);
  return resizedBuffer;
} 
  