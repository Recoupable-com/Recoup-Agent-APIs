import { SearchMode } from "agent-twitter-client";

/**
 * Maps a string to the corresponding SearchMode enum value.
 */
const getSearchModeEnum = (mode: string): SearchMode | undefined => {
  switch (mode) {
    case "Top":
      return SearchMode.Top;
    case "Latest":
      return SearchMode.Latest;
    case "Photos":
      return SearchMode.Photos;
    case "Videos":
      return SearchMode.Videos;
    case "Users":
      return SearchMode.Users;
    default:
      return undefined;
  }
};

export default getSearchModeEnum;
