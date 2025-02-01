import { STEP_OF_AGENT } from "./step";
import { RATE_LIMIT_EXCEEDED, UNKNOWN_PROFILE_ERROR } from "./twitter/errors";

const getErrorStatus = (errorMsg: string) => {
  switch (errorMsg) {
    case UNKNOWN_PROFILE_ERROR:
      return STEP_OF_AGENT.UNKNOWN_PROFILE;
    case RATE_LIMIT_EXCEEDED:
      return STEP_OF_AGENT.RATE_LIMIT_EXCEEDED;
    default:
      return STEP_OF_AGENT.ERROR;
  }
};

export default getErrorStatus;
