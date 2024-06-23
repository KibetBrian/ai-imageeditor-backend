import { redisClient } from "./redis";

type Status = 'processing' | 'processed' | 'failed';

interface State {
  imageId: string;
  status: Status;
  base64Image?: string;
  imageName: string;
}

interface BackgroundRemovedImage {
  imageId: string;
  imageBase64: string;
  imageName: string;
  status: Status;
}

export const setImageBackgroundRemovalState = async (state: State): Promise<void> => {

  const key = `backgroundRemoval${state.imageId}`;

  const stringifiedState = JSON.stringify(state);

  await redisClient.set(key, stringifiedState);

};

export const removeImageBackgroundRemovalState = async ({ imageId }: { imageId: string }): Promise<void> => {
  const key = `backgroundRemoval${imageId}`;

  await redisClient.del(key);
};

export const getImageBackgroundRemovalState = async ({ imageId }: { imageId: string }): Promise<BackgroundRemovedImage> => {

  const key = `backgroundRemoval${imageId}`;

  const state = await redisClient.get(key);

  if (!state) {
    return {
      imageId,
      imageBase64: '',
      imageName: '',
      status: 'failed'
    } as BackgroundRemovedImage;
  }

  const { status } = JSON.parse(state) as BackgroundRemovedImage;

  if (status !== 'processing') {
    await removeImageBackgroundRemovalState({ imageId });
  }

  return JSON.parse(state);
};
