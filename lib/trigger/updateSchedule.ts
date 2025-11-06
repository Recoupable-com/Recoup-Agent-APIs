import { schedules } from "@trigger.dev/sdk";

type UpdateScheduleParams = {
  scheduleId: string;
  cron: string;
};

/**
 * Updates an existing Trigger.dev schedule with a new cron expression
 */
export async function updateSchedule(
  params: UpdateScheduleParams
): Promise<void> {
  await schedules.update(params.scheduleId, {
    task: "customer-prompt-task",
    cron: params.cron,
  });
}
