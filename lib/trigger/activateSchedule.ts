import { schedules } from "@trigger.dev/sdk";

/**
 * Activates a Trigger.dev schedule by its ID
 */
export async function activateSchedule(scheduleId: string): Promise<void> {
  await schedules.activate(scheduleId);
}
