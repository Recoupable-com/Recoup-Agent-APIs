import { Request, Response } from "express";
import { STEP_OF_AGENT } from "../lib/step";
import { generateSegmentsForAccount } from "../lib/services/segmentService";
import processPlatforms from "../lib/services/processPlatforms";
import areAllPlatformsComplete from "../lib/supabase/areAllPlatformsComplete";
import updateAllAgentStatuses from "../lib/supabase/updateAllAgentStatuses";
import { z } from "zod";
import { createAgent } from "../lib/supabase/createAgent";

const HandlesSchema = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  spotify: z.string().optional(),
});

const RequestSchema = z.object({
  handles: HandlesSchema,
  artistId: z.string().optional(),
});

export class PilotController {
  public async run_agent(req: Request, res: Response): Promise<Response> {
    const validationResult = RequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error("[ERROR] Invalid request format:", {
        errors: validationResult.error.errors,
        body: req.body,
      });
      return res.status(400).json({
        message: "Invalid request format",
        errors: validationResult.error.errors,
      });
    }
    const { handles, artistId } = validationResult.data;
    console.log("[DEBUG] Validated request data:", {
      handles: Object.entries(handles).reduce(
        (acc, [k, v]) => ({
          ...acc,
          [k]: v,
        }),
        {}
      ),
      artistId,
    });

    if (!Object.values(handles).some((h) => h?.trim())) {
      console.error("[ERROR] No handles provided in request");
      return res.status(400).json({ message: "No handles provided." });
    }

    console.log("[DEBUG] Creating new agent");
    const { agent, error: agentError } = await createAgent();

    if (!agent) {
      console.error("[ERROR] Failed to create agent:", {
        error: agentError,
      });
      return res.status(500).json({
        message: "Failed to create agent",
      });
    }

    const response = res.status(200).json({
      message: "Agent created successfully",
      agentId: agent.id,
    });

    console.log("[DEBUG] Starting background platform processing:", {
      agentId: agent.id,
      platforms: Object.keys(handles).filter((k) =>
        handles[k as keyof typeof handles]?.trim()
      ),
    });

    try {
      await processPlatforms(agent.id, handles, artistId);

      const allComplete = await areAllPlatformsComplete(agent.id);

      if (allComplete && artistId) {
        await updateAllAgentStatuses(agent.id, STEP_OF_AGENT.SEGMENTS);
        await generateSegmentsForAccount(artistId);
        await updateAllAgentStatuses(agent.id, STEP_OF_AGENT.FINISHED);
      }

      console.log("[INFO] Background processing completed successfully:", {
        agentId: agent.id,
        allComplete,
      });
    } catch (error) {
      console.error("[ERROR] Background processing failed:", {
        agentId: agent.id,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
      });
    }

    return response;
  }
}
