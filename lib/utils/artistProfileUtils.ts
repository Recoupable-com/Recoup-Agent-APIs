import {
  ArtistProfileResponse,
  ArtistProfile,
} from "../../types/artistProfile.types";

/**
 * Creates an error response for the artist profile API
 */
export const createErrorResponse = (
  message: string
): ArtistProfileResponse => ({
  status: "error",
  profile: null,
  error: message,
});

/**
 * Creates an empty artist profile with default values
 */
export const createEmptyProfile = (artistAccountId: string): ArtistProfile => ({
  id: artistAccountId,
  profiles: [],
  total_followers: 0,
  total_following: 0,
  total_posts: 0,
  updated_at: new Date().toISOString(),
});
