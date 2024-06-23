import { S3Client, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import logger from './logger';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const cloudFlareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

const cloudfareBucketName = 'image-editor';

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${cloudFlareAccountId}.r2.cloudflarestorage.com/${cloudfareBucketName}`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

interface StoreImage {
    bucketName: string;
    key: string;
    body: Buffer
}

export const storeImage = async ({ bucketName, key, body }: StoreImage) => {
  try {

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    });

    await s3.send(command);

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const url = getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });

    return url;
  } catch (e) {
    logger.error(`Error storing image: ${e}`);

    return null;
  }
};

export const deleteImage = async ({ bucketName, key }: { bucketName: string; key: string }) => {
  try {

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3.send(command);

    return true;
  } catch (e) {
    logger.error(`Error deleting image: ${e}`);

    return false;
  }
};

export const getImage = async ({ bucketName, key }: { bucketName: string; key: string }) => {
  try {

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const data = await s3.send(command);

    return data;
  } catch (e) {
    logger.error(`Error getting image: ${e}`);

    return null;
  }
};

export const getImagePresignedUrl = async ({ bucketName, key }: { bucketName: string; key: string }) => {
  try {

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const url = getSignedUrl(s3, command, { expiresIn: 3600 });

    return url;
  } catch (e) {
    logger.error(`Error getting presigned URL: ${e}`);

    return null;
  }
};