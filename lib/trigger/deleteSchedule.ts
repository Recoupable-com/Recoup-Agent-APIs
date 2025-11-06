import { schedules } from "@trigger.dev/sdk";

/**
 * Deletes a Trigger.dev schedule by its ID
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  await schedules.del(scheduleId);
}
