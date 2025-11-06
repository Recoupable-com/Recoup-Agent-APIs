import { schedules } from "@trigger.dev/sdk";

/**
 * Deactivates a Trigger.dev schedule by its ID
 */
export async function deactivateSchedule(scheduleId: string): Promise<void> {
  await schedules.deactivate(scheduleId);
}
