import { schedules } from "@trigger.dev/sdk";

type UpdateScheduleParams = {
  scheduleId: string;
  cron: string;
  externalId: string;
};

/**
 * Updates an existing Trigger.dev schedule with a new cron expression.
 * Includes externalId to prevent it from being cleared during updates.
 */
export async function updateSchedule(
  params: UpdateScheduleParams
): Promise<void> {
  await schedules.update(params.scheduleId, {
    task: "customer-prompt-task",
    cron: params.cron,
    externalId: params.externalId,
  });
}
