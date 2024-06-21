
export type Queue = 'backgroundRemoval';

export interface CallBack{
    message: string;
    queue: Queue;
}

export interface ConsumeFromQueue{
    queue: Queue;
    // eslint-disable-next-line no-unused-vars
    callback: (input:CallBack) => Promise<void>
}

export interface SendPayloadToQueue {
    queue: Queue
    payload: unknown
}