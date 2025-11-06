import { Request, Response } from "express";
import { updateScheduledAction } from "../../lib/supabase/scheduled_actions/updateScheduledAction";
import { updateSchedule } from "../../lib/trigger/updateSchedule";
import { deactivateSchedule } from "../../lib/trigger/deactivateSchedule";
import { activateSchedule } from "../../lib/trigger/activateSchedule";
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

    const updateData: Partial<TablesUpdate<"scheduled_actions">> = {};
    if (title !== undefined) updateData.title = title;
    if (prompt !== undefined) updateData.prompt = prompt;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (account_id !== undefined) updateData.account_id = account_id;
    if (artist_account_id !== undefined)
      updateData.artist_account_id = artist_account_id;
    if (enabled !== undefined) updateData.enabled = enabled;

    const updated = await updateScheduledAction({
      id,
      ...updateData,
    });

    // Update Trigger.dev schedule if schedule was provided
    if (schedule !== undefined) {
      try {
        await updateSchedule({
          scheduleId: updated.trigger_schedule_id!,
          cron: schedule,
        });
      } catch (error) {
        console.error(
          `Error updating Trigger.dev schedule:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    // Deactivate/activate Trigger.dev schedule based on enabled status
    if (enabled !== undefined) {
      try {
        if (enabled === false) {
          await deactivateSchedule(updated.trigger_schedule_id!);
        } else if (enabled === true) {
          await activateSchedule(updated.trigger_schedule_id!);
        }
      } catch (error) {
        console.error(
          `Error ${enabled === false ? "deactivating" : "activating"} Trigger.dev schedule:`,
          error instanceof Error ? error.message : error
        );
      }
    }

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
