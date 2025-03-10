import dotenv from "dotenv";
import { APIFY_TOKEN } from "../consts";

dotenv.config();

const getRun = async (runId: string) => {
  try {
    console.log("getRun: Run ID", { runId });

    const response = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data: any = await response.json();

    console.log("getRun: Data", { data });
    return data;
  } catch (error) {
    console.error(error);
    return "RUNNING";
  }
};

export default getRun;
