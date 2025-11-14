import { Request, Response } from "express";

/**
 * Handles GET requests for artists list
 * Returns mock artists data
 */
export const getArtistsProHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const mockResponse = {
    status: "success",
    artists: [
      {
        id: "1",
        name: "Artist One",
        timestamp: 1234567890,
      },
      {
        id: "2",
        name: "Artist Two",
        timestamp: 1234567891,
      },
      {
        id: "3",
        name: "Artist Three",
        timestamp: 1234567892,
      },
    ],
  };

  res.status(200).json(mockResponse);
};
