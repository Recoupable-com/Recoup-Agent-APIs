import getActorStatus from "../apify/getActorStatus.js";
import getDataset from "../apify/getDataset.js";
import { Funnel_Type } from "../funnels.js";
import { STEP_OF_ANALYSIS } from "../step.js";
import { UNKNOWN_PROFILE_ERROR } from "../twitter/errors.js";
import getFormattedAccount from "./getFormattedAccount.js";

const getProfile = async (datasetId, chat_id) => {
  try {
    while (1) {
      const datasetItems = await getDataset(datasetId);
      if (datasetItems?.[0]?.error === UNKNOWN_PROFILE_ERROR) {
        global.io.emit(`${chat_id}`, {
          status: STEP_OF_ANALYSIS.UNKNOWN_PROFILE,
          funnel_type: Funnel_Type.INSTAGRAM,
        });
        throw new Error(datasetItems?.[0]?.error);
      }
      const formattedAccount = getFormattedAccount(datasetItems);
      const status = await getActorStatus(datasetId);
      if (formattedAccount && status === "SUCCEEDED") return formattedAccount;
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export default getProfile;
