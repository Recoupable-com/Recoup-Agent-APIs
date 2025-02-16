/**
 * Represents a comment with fan and artist social IDs for segment generation
 */
export interface Comment {
  comment_text: string;
  fan_social_id: string;
  artist_social_id: string;
}
