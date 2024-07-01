export interface ObjectRemovalApiResponseHeaders {
    "x-request-id": string;
    "content-type": string;
    "finish-reason"?: "CONTENT_FILTERED" | "SUCCESS";
    seed?: string;
    [key: string]: unknown;
  }
  