import { schedules } from "@trigger.dev/sdk";
type CreateScheduleParams = {
  cron: string;
  deduplicationKey: string;
  externalId?: string;
  timezone?: string;
};

export async function createSchedule(params: CreateScheduleParams) {
  const schedule = await schedules.create({
    task: "customer-prompt-task",
    cron: params.cron,
    deduplicationKey: params.deduplicationKey,
    externalId: params.externalId,
    timezone: params.timezone || "UTC",
  });
  console.log("Schedule created:", schedule);
  return schedule;
}
