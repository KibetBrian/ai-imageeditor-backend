import { redisClient } from "./redis";

type Status = 'processing' | 'processed' | 'failed';

interface BackgroundRemovalState {
  imageId: string;
  base64Image: string;
  imageName: string;
  status: Status;
  message: string;
}

const BACKGROUND_REMOVAL_KEY_PREFIX = 'backgroundRemoval';

const getBackgroundRemovalKey = (imageId: string): string => `${BACKGROUND_REMOVAL_KEY_PREFIX}:${imageId}`;

const DEFAULT_BACKGROUND_REMOVAL_STATE: Omit<BackgroundRemovalState, 'imageId'> = {
  base64Image: '',
  imageName: '',
  status: 'failed',
  message: 'No record found for this image'
};

export const setImageBackgroundRemovalState = async (state: BackgroundRemovalState): Promise<void> => {
  const key = getBackgroundRemovalKey(state.imageId);

  await redisClient.set(key, JSON.stringify(state));
};

export const removeImageBackgroundRemovalState = async (imageId: string): Promise<void> => {
  const key = getBackgroundRemovalKey(imageId);

  await redisClient.del(key);
};

export const getImageBackgroundRemovalState = async (imageId: string): Promise<BackgroundRemovalState> => {
  const key = getBackgroundRemovalKey(imageId);
  
  const serializedState = await redisClient.get(key);

  if (!serializedState) {
    return { imageId, ...DEFAULT_BACKGROUND_REMOVAL_STATE };
  }

  const state = JSON.parse(serializedState) as BackgroundRemovalState;

  if (state.status !== 'processing') {
    await removeImageBackgroundRemovalState(imageId);
  }

  return state;
};