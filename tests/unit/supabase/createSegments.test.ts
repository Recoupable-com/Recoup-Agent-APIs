/// <reference types="jest" />

import createSegments from "../../../lib/supabase/createSegments";
import supabase from "../../../lib/supabase/serverClient";

// Mock the Supabase client
jest.mock("../../../lib/supabase/serverClient", () => ({
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  })),
}));

describe("createSegments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully create segments", async () => {
    // Mock data
    const mockSegmentNames = ["superfans", "casual_listeners"];
    const mockInsertResponse = {
      data: [
        { id: "segment1", name: "superfans" },
        { id: "segment2", name: "casual_listeners" },
      ],
      error: null,
    };

    // Setup mock
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockInsertResponse),
    });

    // Execute test
    const result = await createSegments({ segmentNames: mockSegmentNames });

    // Verify the result
    expect(result).toEqual({
      segmentIds: ["segment1", "segment2"],
      error: null,
    });

    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith("segments");
  });

  it("should handle database errors gracefully", async () => {
    // Mock data
    const mockSegmentNames = ["superfans"];
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
    const result = await createSegments({ segmentNames: mockSegmentNames });

    // Verify error handling
    expect(result).toEqual({
      segmentIds: [],
      error: expect.any(Error),
    });

    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith("segments");
  });

  it("should handle batch processing of segments", async () => {
    // Mock data with more than batchSize segments
    const mockSegmentNames = Array(150)
      .fill("segment")
      .map((s, i) => `${s}_${i}`);
    const mockBatchResponse = {
      data: mockSegmentNames.slice(0, 100).map((name, i) => ({
        id: `id_${i}`,
        name,
      })),
      error: null,
    };

    // Setup mock
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockBatchResponse),
    });

    // Execute test
    const result = await createSegments({ segmentNames: mockSegmentNames });

    // Verify batch processing
    expect(result.error).toBeNull();
    expect(result.segmentIds.length).toBeGreaterThan(0);
    expect(supabase.from).toHaveBeenCalledTimes(2); // Called for each batch
  });
});
