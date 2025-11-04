import { Request, Response } from "express";
import { selectScheduledActions } from "../../lib/supabase/scheduled_actions/selectScheduledActions";

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


