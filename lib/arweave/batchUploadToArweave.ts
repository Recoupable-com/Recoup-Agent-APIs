import { UploadResult, UploadTask, UPLOAD_CONFIG } from "./types";
import uploadPfpToArweave from "./uploadPfpToArweave";

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
  const config = { ...UPLOAD_CONFIG, ...options };

  if (tasks.length === 0) {
    return [];
  }

  const results: UploadResult[] = [];
  const startTime = Date.now();

  console.log(
    `Starting batch upload of ${tasks.length} images to Arweave with batch size ${config.BATCH_SIZE}`
  );

  for (let i = 0; i < tasks.length; i += config.BATCH_SIZE) {
    const batchStartTime = Date.now();
    const batch = tasks.slice(i, i + config.BATCH_SIZE);
    const batchNumber = Math.floor(i / config.BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(tasks.length / config.BATCH_SIZE);

    console.log(
      `Processing batch ${batchNumber}/${totalBatches} (${batch.length} uploads)`
    );

    const batchResults = await Promise.all(
      batch.map(async (task) => {
        try {
          console.log(`Starting Arweave upload for ${task.id}...`);

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
