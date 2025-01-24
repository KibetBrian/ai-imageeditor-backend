import * as ampq from 'amqplib';
import { Queue, SendPayloadToQueue } from './types';
import logger from '../utils/logger';
import { backgroundRemoval } from './consumers/background_removal/backgroundRemoval';
import { BackgroundRemovalQueuePayload } from './consumers/background_removal/types';

const queues: Queue[] = ['backgroundRemoval'];

export const connectToRabbitMQ = async () => {
  const connection = await ampq.connect('amqp://localhost');

  const channel = await connection.createChannel();

  queues.forEach(async queue => {
    await channel.assertQueue(queue);
  });

  // eslint-disable-next-line no-console
  console.log('Connected to RabbitMQ');
  return channel;
};

export const sendMessageToQueue = async ({ payload, queue }: SendPayloadToQueue) => {
  try {
    const channel = await connectToRabbitMQ();

    const messageToSend = JSON.stringify(payload);

    channel.sendToQueue(queue, Buffer.from(messageToSend), { persistent: true });
  } catch (e) {
    logger.error({
      messages: 'Error sending message to queue',
      functionName: 'sendMessageToQueue',
      error: e
    });

  }
};

export const consumeFromQueue = async (queue: Queue) => {
  try {
    const channel = await connectToRabbitMQ();

    channel.consume(queue, async (message) => {
      if (message) {
        const messageString = message.content.toString();

        const messageObject = JSON.parse(messageString);

        if (queue === 'backgroundRemoval') {
          await backgroundRemoval(messageObject as BackgroundRemovalQueuePayload);
          
          channel.ack(message);
        }
      }
    });
  } catch (e) {
    logger.error({
      messages: 'Error consuming message from queue',
      functionName: 'consumeFromQueue',
      error: e
    });
  }
};

export const consumeFromAllQueues = async () => {
  queues.forEach(async queue => {
    await consumeFromQueue(queue);
  });
};