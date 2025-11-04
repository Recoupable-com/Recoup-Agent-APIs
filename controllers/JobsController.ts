import { Request, Response } from "express";
import { selectScheduledActions } from "../lib/supabase/scheduled_actions/selectScheduledActions";
import {
  insertScheduledAction,
  CreateJobInput,
} from "../lib/supabase/scheduled_actions/insertScheduledAction";

/**
 * Retrieves jobs (scheduled actions) from the database.
 * If a job `id` is provided, returns a single job matching that ID.
 * Otherwise, returns an array of all jobs.
 */
export const getJobsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

    const jobs = await selectScheduledActions({
      id: id && typeof id === "string" ? id : undefined,
    });

    res.json({
      status: "success",
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

/**
 * Creates a new job (scheduled action)
 * Returns the created job in an array, matching GET response shape
 */
export const createJobHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, prompt, schedule, account_id, artist_account_id } =
      req.body as Partial<CreateJobInput>;

    // Basic validation per docs
    if (!title || !prompt || !schedule || !account_id || !artist_account_id) {
      res.status(400).json({
        status: "error",
        error:
          "title, prompt, schedule, account_id, and artist_account_id are required",
      });
      return;
    }

    const jobs = await insertScheduledAction({
      title,
      prompt,
      schedule,
      account_id,
      artist_account_id,
    });

    res.json({ status: "success", jobs });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
