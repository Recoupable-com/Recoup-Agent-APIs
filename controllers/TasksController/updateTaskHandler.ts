import { Request, Response } from "express";
import { updateScheduledAction } from "../../lib/supabase/scheduled_actions/updateScheduledAction";
import { selectScheduledActions } from "../../lib/supabase/scheduled_actions/selectScheduledActions";
import { syncTriggerSchedule } from "../../lib/trigger/syncTriggerSchedule";
import type { TablesUpdate } from "../../types/database.types";

/**
 * Updates an existing task (scheduled action)
 * Only the `id` field is required; any additional fields will be updated.
 * If `schedule` (cron) is updated, the corresponding Trigger.dev schedule is also updated.
 * Returns the updated task in an array, matching GET response shape
 */
export const updateTaskHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      id,
      title,
      prompt,
      schedule,
      account_id,
      artist_account_id,
      enabled,
    } = req.body as { id: string } & Partial<TablesUpdate<"scheduled_actions">>;

    if (!id) {
      res.status(400).json({
        status: "error",
        error: "id is required",
      });
      return;
    }

    const existingTasks = await selectScheduledActions({ id });
    const existingTask = existingTasks[0];

    if (!existingTask) {
      res.status(404).json({
        status: "error",
        error: "Task not found",
      });
      return;
    }

    const updateData: Partial<TablesUpdate<"scheduled_actions">> = {};
    if (title !== undefined) updateData.title = title;
    if (prompt !== undefined) updateData.prompt = prompt;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (account_id !== undefined) updateData.account_id = account_id;
    if (artist_account_id !== undefined)
      updateData.artist_account_id = artist_account_id;
    if (enabled !== undefined) updateData.enabled = enabled;

    const finalEnabled =
      enabled !== undefined ? enabled : (existingTask.enabled ?? true);
    const cronExpression = schedule ?? existingTask.schedule ?? undefined;
    const scheduleChanged = schedule !== undefined;

    let newTriggerScheduleId: string | null;
    newTriggerScheduleId = await syncTriggerSchedule({
      taskId: id,
      enabled: finalEnabled,
      cronExpression,
      scheduleChanged,
      existingScheduleId: existingTask.trigger_schedule_id ?? null,
    });

    if (newTriggerScheduleId !== existingTask.trigger_schedule_id) {
      updateData.trigger_schedule_id = newTriggerScheduleId;
    }

    const updated = await updateScheduledAction({
      id,
      ...updateData,
    });

    res.json({
      status: "success",
      tasks: [updated],
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
