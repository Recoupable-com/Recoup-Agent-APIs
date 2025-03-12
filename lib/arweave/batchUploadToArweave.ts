import uploadPfpToArweave from "./uploadPfpToArweave";

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

/**
 * Uploads multiple images to Arweave in parallel batches
 *
 * @param tasks - Array of upload tasks
 * @param options - Configuration options for batch processing
 * @returns Array of upload results
 */
export async function batchUploadToArweave(
  tasks: UploadTask[],
  options: Partial<typeof UPLOAD_CONFIG> = {}
): Promise<UploadResult[]> {
  // Merge default config with provided options
  const config = { ...UPLOAD_CONFIG, ...options };

  if (tasks.length === 0) {
    return [];
  }

  const results: UploadResult[] = [];
  const startTime = Date.now();

  console.log(
    `Starting batch upload of ${tasks.length} images to Arweave with batch size ${config.BATCH_SIZE}`
  );

  // Process uploads in batches
  for (let i = 0; i < tasks.length; i += config.BATCH_SIZE) {
    const batchStartTime = Date.now();
    const batch = tasks.slice(i, i + config.BATCH_SIZE);
    const batchNumber = Math.floor(i / config.BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(tasks.length / config.BATCH_SIZE);

    console.log(
      `Processing batch ${batchNumber}/${totalBatches} (${batch.length} uploads)`
    );

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (task) => {
        try {
          console.log(`Starting Arweave upload for ${task.id}...`);

          // Try to upload with retries
          let arweaveUrl: string | null = null;
          let attempts = 0;

          while (attempts < config.RETRY_ATTEMPTS && !arweaveUrl) {
            if (attempts > 0) {
              console.log(`Retry attempt ${attempts} for ${task.id}`);
              await new Promise((resolve) =>
                setTimeout(resolve, config.RETRY_DELAY)
              );
            }

            arweaveUrl = await uploadPfpToArweave(task.imageUrl);
            attempts++;
          }

          if (arweaveUrl) {
            console.log(`✅ Uploaded to Arweave: ${task.id}`);
            console.log(`   Original URL: ${task.imageUrl}`);
            console.log(`   Arweave URL: ${arweaveUrl}`);

            return {
              id: task.id,
              imageUrl: task.imageUrl,
              success: true,
              arweaveUrl,
              metadata: task.metadata,
            };
          } else {
            console.log(
              `⚠️ Arweave upload failed for ${task.id} after ${attempts} attempts`
            );

            return {
              id: task.id,
              imageUrl: task.imageUrl,
              success: false,
              error: new Error(`Upload failed after ${attempts} attempts`),
              metadata: task.metadata,
            };
          }
        } catch (error) {
          console.error(`❌ Error uploading to Arweave for ${task.id}:`, error);

          return {
            id: task.id,
            imageUrl: task.imageUrl,
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
            metadata: task.metadata,
          };
        }
      })
    );

    results.push(...batchResults);

    const batchDuration = Date.now() - batchStartTime;
    const avgTimePerUpload = Math.round(batchDuration / batch.length);
    console.log(
      `Batch ${batchNumber} completed in ${batchDuration}ms (avg: ${avgTimePerUpload}ms per upload)`
    );
  }

  const totalDuration = Date.now() - startTime;
  const successCount = results.filter((r) => r.success).length;

  console.log(`Batch upload completed in ${totalDuration}ms`);
  console.log(
    `Success: ${successCount}/${tasks.length} (${Math.round((successCount / tasks.length) * 100)}%)`
  );

  return results;
}

export default batchUploadToArweave;
