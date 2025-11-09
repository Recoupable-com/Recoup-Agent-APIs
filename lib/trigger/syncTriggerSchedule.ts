import { createSchedule } from "./createSchedule";
import { updateSchedule } from "./updateSchedule";
import { deleteSchedule } from "./deleteSchedule";

type SyncTriggerScheduleParams = {
  taskId: string;
  enabled: boolean;
  cronExpression: string;
  scheduleChanged: boolean;
  existingScheduleId: string | null;
};

/**
 * Synchronises the Trigger.dev schedule for a task based on the desired enabled state
 * and cron expression. Returns the resulting Trigger.dev schedule id or null.
 */
export async function syncTriggerSchedule(
  params: SyncTriggerScheduleParams
): Promise<string | null> {
  const {
    taskId,
    enabled,
    cronExpression,
    scheduleChanged,
    existingScheduleId,
  } = params;
  const shouldDeleteSchedule = !enabled && existingScheduleId;
  const shouldUpdateSchedule = existingScheduleId && scheduleChanged;
  const shouldCreateSchedule = enabled && !existingScheduleId;

  if (shouldDeleteSchedule) {
    await deleteSchedule(existingScheduleId);
    return null;
  }

  if (shouldUpdateSchedule) {
    await updateSchedule({
      scheduleId: existingScheduleId,
      cron: cronExpression,
    });
    return existingScheduleId;
  }

  if (shouldCreateSchedule) {
    const createdSchedule = await createSchedule({
      cron: cronExpression,
      deduplicationKey: taskId,
      externalId: taskId,
    });
    return createdSchedule.id;
  }

  return existingScheduleId;
}
