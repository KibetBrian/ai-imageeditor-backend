import { redisClient } from "./redis";

type Status = 'processing' | 'processed' | 'failed';

interface BackgroundRemovalState {
  imageId: string;
  base64Image: string;
  imageName: string;
  status: Status;
  message: string;
}

export const setImageBackgroundRemovalState = async (state: BackgroundRemovalState): Promise<void> => {

  const key = `backgroundRemoval${state.imageId}`;

  const stringifiedState = JSON.stringify(state);

  await redisClient.set(key, stringifiedState);

};

export const removeImageBackgroundRemovalState = async ({ imageId }: { imageId: string }): Promise<void> => {
  const key = `backgroundRemoval${imageId}`;

  await redisClient.del(key);
};

export const getImageBackgroundRemovalState = async ({ imageId }: { imageId: string }): Promise<BackgroundRemovalState> => {

  const key = `backgroundRemoval${imageId}`;

  const state = await redisClient.get(key);

  if (!state) {
    return {
      imageId,
      base64Image: '',
      imageName: '',
      status: 'failed'
    } as BackgroundRemovalState;
  }

  const { status } = JSON.parse(state) as BackgroundRemovalState;

  if (status !== 'processing') {
    await removeImageBackgroundRemovalState({ imageId });
  }

  return JSON.parse(state);
};
