import { Request, Response } from "express";
import { updateScheduledAction } from "../../lib/supabase/scheduled_actions/updateScheduledAction";
import type { TablesUpdate } from "../../../types/database.types";

/**
 * Updates an existing task (scheduled action)
 * Only the `id` field is required; any additional fields will be updated.
 * Returns the updated task in an array, matching GET response shape
 */
export const updateTaskHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, title, prompt, schedule, account_id, artist_account_id } =
      req.body as { id: string } & Partial<TablesUpdate<"scheduled_actions">>;

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
