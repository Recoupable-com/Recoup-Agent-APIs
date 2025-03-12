/**
 * Configuration for parallel uploads
 */
export const UPLOAD_CONFIG = {
  BATCH_SIZE: 5, // Number of concurrent uploads
  RETRY_ATTEMPTS: 2, // Number of retry attempts for failed uploads
  RETRY_DELAY: 1000, // Delay between retries in milliseconds
};

/**
 * Interface for upload task
 */
export interface UploadTask {
  id: string; // Unique identifier for the task (e.g., username)
  imageUrl: string; // URL of the image to upload
  metadata?: Record<string, unknown>; // Optional metadata to associate with the task
}

/**
 * Interface for upload result
 */
export interface UploadResult {
  id: string; // Unique identifier matching the task
  imageUrl: string; // Original image URL
  success: boolean; // Whether the upload was successful
  arweaveUrl?: string; // Arweave URL if successful
  error?: Error; // Error if unsuccessful
  metadata?: Record<string, unknown>; // Optional metadata from the task
}
