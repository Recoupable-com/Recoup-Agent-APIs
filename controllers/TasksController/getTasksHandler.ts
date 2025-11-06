import { Request, Response } from "express";
import { selectScheduledActions } from "../../lib/supabase/scheduled_actions/selectScheduledActions";

/**
 * Retrieves tasks (scheduled actions) from the database.
 * Supports filtering by id, account_id, or artist_account_id.
 * If an `id` is provided, returns a single task matching that ID.
 * Otherwise, returns an array of all tasks (optionally filtered).
 */
export const getTasksHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, account_id, artist_account_id } = req.query;

    const tasks = await selectScheduledActions({
      id: id && typeof id === "string" ? id : undefined,
      account_id:
        account_id && typeof account_id === "string" ? account_id : undefined,
      artist_account_id:
        artist_account_id && typeof artist_account_id === "string"
          ? artist_account_id
          : undefined,
    });

    res.json({
      status: "success",
      tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
