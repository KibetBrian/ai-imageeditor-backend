import { thirdPartyApiConfigs } from '../../configs/configs';
import prisma from '../../prisma/client';

interface ProcessedImage {
    name: string;
    data: string  //base 64
}

interface AfterSuccessfulProcess {
    images: ProcessedImage[];
    userId: string;
}

export const afterSuccessfulProcess = async ({ images, userId }: AfterSuccessfulProcess) => {
  const totalCredits = images.length * thirdPartyApiConfigs.stableDiffusion.backgroundRemoval.credits;

  await prisma.users.update({
    where: {
      userId
    },
    data: {
      credits: {
        decrement: totalCredits
      }
    }
  });
};