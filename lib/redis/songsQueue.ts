import { Queue, Job } from "bullmq";
import redis from "./connection";

// Queue configuration
const queueConfig = {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: false, // Don't remove completed jobs immediately
    removeOnFail: false, // Don't remove failed jobs immediately
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: "exponential" as const,
      delay: 2000, // Start with 2 second delay
    },
  },
};

// Create the songs ISRC processing queue
export const songsIsrcQueue = new Queue("songs-isrc-processing", queueConfig);

// Add queue event listeners for debugging
songsIsrcQueue.on("error", (error) => {
  console.error("[Queue] Queue error:", error);
});

// Job data interface for type safety
export interface SongsIsrcJobData {
  isrc: string;
}

export default songsIsrcQueue;
