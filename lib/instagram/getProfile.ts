import getDataset from "../apify/getDataset";
import { Funnel_Type } from "../funnels";
import { STEP_OF_ANALYSIS } from "../step";
import { RATE_LIMIT_EXCEEDED, UNKNOWN_PROFILE_ERROR } from "../twitter/errors";
import getFormattedAccount from "./getFormattedAccount";

const getProfile = async (datasetId: string, chat_id: string | null) => {
  try {
    while (1) {
      const datasetItems: any = await getDataset(datasetId);
      const errorMessage = datasetItems?.[0]?.error;
      if (errorMessage === UNKNOWN_PROFILE_ERROR) {
        const error = {
          error: errorMessage,
          status: STEP_OF_ANALYSIS.UNKNOWN_PROFILE,
          funnel_type: Funnel_Type.INSTAGRAM,
        };
        global.io.emit(`${chat_id}`, error);
        return { error };
      }
      if (errorMessage === RATE_LIMIT_EXCEEDED) {
        const error = {
          status: STEP_OF_ANALYSIS.RATE_LIMIT_EXCEEDED,
          funnel_type: Funnel_Type.INSTAGRAM,
          error: errorMessage,
        };
        global.io.emit(`${chat_id}`, error);
        return { error };
      }
      if (errorMessage) throw new Error(errorMessage);
      const formattedAccount = getFormattedAccount(datasetItems);
      if (formattedAccount) return formattedAccount;
    }
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
};

export default getProfile;
