/// <reference types="jest" />

// Mock dependencies before imports
jest.mock("../../../lib/supabase/serverClient");
jest.mock("../../../lib/supabase/getAccountSocials");
jest.mock("../../../lib/supabase/getFansBySegment");
jest.mock("../../../lib/supabase/getCommentsBySocialIds");
jest.mock("../../../lib/supabase/getSegmentById");

import getArtistSegmentComments from "../../../lib/supabase/getArtistSegmentComments";
import { getAccountSocials } from "../../../lib/supabase/getAccountSocials";
import getFansBySegment from "../../../lib/supabase/getFansBySegment";
import getCommentsBySocialIds from "../../../lib/supabase/getCommentsBySocialIds";
import getSegmentById from "../../../lib/supabase/getSegmentById";

describe("getArtistSegmentComments", () => {
  const mockArtistId = "artist123";
  const mockSegmentId = "segment123";
  const mockSegmentName = "superfans";

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock responses
    (getSegmentById as jest.Mock).mockResolvedValue({
      name: mockSegmentName,
      error: null,
    });

    (getAccountSocials as jest.Mock).mockResolvedValue({
      status: "success",
      socials: [
        {
          id: "social123",
          username: "testartist",
          followerCount: 1000,
          avatar: "https://example.com/avatar.jpg",
        },
      ],
    });

    (getFansBySegment as jest.Mock).mockResolvedValue({
      fanSocialIds: ["fan123", "fan456"],
      error: null,
    });

    (getCommentsBySocialIds as jest.Mock).mockResolvedValue({
      comments: ["Great music!", "Awesome show!"],
      error: null,
    });
  });

  it("should successfully fetch comments and metrics for valid inputs", async () => {
    const result = await getArtistSegmentComments(mockArtistId, mockSegmentId);

    expect(result).toEqual({
      comments: ["Great music!", "Awesome show!"],
      socialMetrics: {
        followerCount: 1000,
        username: "testartist",
        avatar: "https://example.com/avatar.jpg",
      },
      segmentName: mockSegmentName,
    });

    // Verify function calls
    expect(getSegmentById).toHaveBeenCalledWith(mockSegmentId);
    expect(getAccountSocials).toHaveBeenCalledWith(mockArtistId);
    expect(getFansBySegment).toHaveBeenCalledWith(mockSegmentId);
    expect(getCommentsBySocialIds).toHaveBeenCalledWith(["fan123", "fan456"]);
  });
});
