import { Request, Response } from "express";
import {
  insertScheduledAction,
  CreateJobInput,
} from "../../lib/supabase/scheduled_actions/insertScheduledAction";
import { createSchedule } from "../../lib/trigger/createSchedule";

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
    } as CreateJobInput);

    const created = jobs[0];
    if (!created || !created.id) {
      throw new Error(
        "Failed to create job: missing Supabase id for scheduling"
      );
    }

    await createSchedule({
      cron: schedule,
      deduplicationKey: created.id,
      externalId: created.id,
    });

    res.json({
      status: "success",
      jobs,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
