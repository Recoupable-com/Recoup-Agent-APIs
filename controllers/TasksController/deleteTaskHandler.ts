import { Request, Response } from "express";
import { deleteScheduledAction } from "../../lib/supabase/scheduled_actions/deleteScheduledAction";

/**
 * Deletes an existing task (scheduled action) by its ID
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
