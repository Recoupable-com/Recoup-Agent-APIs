import { z } from "zod";

const apifyPayloadSchema = z.object({
  userId: z.string(),
  createdAt: z.string(),
  eventType: z.string(),
  eventData: z.object({
    actorId: z.string(),
  }),
  resource: z.object({
    defaultDatasetId: z.string(),
  }),
});

export default apifyPayloadSchema;
