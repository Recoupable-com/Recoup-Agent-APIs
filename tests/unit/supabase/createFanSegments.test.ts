/// <reference types="jest" />

import createFanSegments from "../../../lib/supabase/createFanSegments";
import supabase from "../../../lib/supabase/serverClient";

// Mock the Supabase client
jest.mock("../../../lib/supabase/serverClient", () => ({
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  })),
}));

describe("createFanSegments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully create fan segments", async () => {
    // Mock data
    const mockFanSegments = [
      { fan_social_id: "fan1", segment_id: "segment1" },
      { fan_social_id: "fan2", segment_id: "segment1" },
    ];

    // Mock successful insert
    const mockInsertResponse = {
      data: [
        { fan_social_id: "fan1", segment_id: "segment1" },
        { fan_social_id: "fan2", segment_id: "segment1" },
      ],
      error: null,
    };

    // Setup mock
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockInsertResponse),
    });

    // Execute test
    const result = await createFanSegments({ fanSegments: mockFanSegments });

    // Verify the result
    expect(result).toEqual({
      successCount: 2,
      errorCount: 0,
      error: null,
    });

    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith("fan_segments");
  });

  it("should handle database errors gracefully", async () => {
    // Mock data
    const mockFanSegments = [{ fan_social_id: "fan1", segment_id: "segment1" }];

    // Mock error response
    const mockErrorResponse = {
      data: null,
      error: new Error("Database error"),
    };

    // Setup mock
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockErrorResponse),
    });

    // Execute test
    const result = await createFanSegments({ fanSegments: mockFanSegments });

    // Verify error handling
    expect(result).toEqual({
      successCount: 0,
      errorCount: 1,
      error: null,
    });

    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith("fan_segments");
  });
});
