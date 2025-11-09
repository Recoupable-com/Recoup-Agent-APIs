import { Request, Response } from "express";
import { selectRooms } from "../../lib/supabase/rooms/selectRooms";

export const getChatsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { account_id, artist_account_id } = req.query;

    if (!account_id || typeof account_id !== "string") {
      res.status(400).json({
        status: "error",
        error: "account_id query parameter is required",
      });
      return;
    }

    const chats = await selectRooms({
      account_id,
      artist_account_id:
        artist_account_id && typeof artist_account_id === "string"
          ? artist_account_id
          : undefined,
    });

    res.json({
      status: "success",
      chats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
