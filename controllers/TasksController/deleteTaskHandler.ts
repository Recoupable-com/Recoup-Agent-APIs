import { Request, Response } from "express";
import { deleteScheduledAction } from "../../lib/supabase/scheduled_actions/deleteScheduledAction";
import { selectScheduledActions } from "../../lib/supabase/scheduled_actions/selectScheduledActions";
import { deleteSchedule } from "../../lib/trigger/deleteSchedule";

/**
 * Deletes an existing task (scheduled action) by its ID
 * Also deletes the corresponding Trigger.dev schedule if it exists
 * Returns only the status of the delete operation
 */
export const deleteTaskHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.body as { id?: string };

    if (!id) {
      res.status(400).json({
        status: "error",
        error: "id is required",
      });
      return;
    }

    // Get scheduled action to check for trigger_schedule_id
    const scheduledActions = await selectScheduledActions({ id });
    const scheduledAction = scheduledActions[0];

    if (!scheduledAction) {
      res.status(404).json({
        status: "error",
        error: "Task not found",
      });
      return;
    }

    // Delete from Trigger.dev
    await deleteSchedule(scheduledAction.trigger_schedule_id);

    // Delete from database
    await deleteScheduledAction(id);

    res.json({
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
