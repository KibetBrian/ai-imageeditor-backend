export interface ImageBuffer {
    type: "Buffer";
    data: number[];
}

export interface BackgroundRemovalQueuePayload{
    imageBuffer:ImageBuffer;
    imageName: string;
    imageId: string;
    userId: string;
}