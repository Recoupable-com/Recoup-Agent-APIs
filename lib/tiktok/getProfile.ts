import getDataset from "../apify/getDataset.js";
import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import { UNKNOWN_PROFILE_ERROR } from "../twitter/errors.js";
import getFormattedAccount from "./getFormattedAccount.js";

const getProfile = async (
  datasetId: string,
  pilot_id: string | null = null,
) => {
  try {
    while (1) {
      const datasetItems: any = await getDataset(datasetId);
      const errorMessage = datasetItems?.[0]?.error;
      if (errorMessage === UNKNOWN_PROFILE_ERROR) {
        const error = {
          status: STEP_OF_ANALYSIS.UNKNOWN_PROFILE,
          funnel_type: Funnel_Type.INSTAGRAM,
          error: errorMessage,
        };
        global.io.emit(`${pilot_id}`, error);
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
