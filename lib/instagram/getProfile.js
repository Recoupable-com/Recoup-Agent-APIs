import getDataset from "../apify/getDataset.js";
import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import {
  RATE_LIMIT_EXCEEDED,
  UNKNOWN_PROFILE_ERROR,
} from "../twitter/errors.js";
import getFormattedAccount from "./getFormattedAccount.js";

const getProfile = async (datasetId, chat_id) => {
  try {
    while (1) {
      const datasetItems = await getDataset(datasetId);
      if (datasetItems?.[0]?.error === UNKNOWN_PROFILE_ERROR) {
        const error = {
          error: datasetItems?.[0]?.error,
          status: STEP_OF_ANALYSIS.UNKNOWN_PROFILE,
          funnel_type: Funnel_Type.INSTAGRAM,
        };
        global.io.emit(`${chat_id}`, error);
        return error;
      }
      if (datasetItems?.error?.message === RATE_LIMIT_EXCEEDED) {
        const error = {
          status: STEP_OF_ANALYSIS.RATE_LIMIT_EXCEEDED,
          funnel_type: Funnel_Type.INSTAGRAM,
          error: datasetItems?.error?.message,
        };
        global.io.emit(`${chat_id}`, error);
        return error;
      }
      const formattedAccount = getFormattedAccount(datasetItems);
      if (formattedAccount) return formattedAccount;
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export default getProfile;
