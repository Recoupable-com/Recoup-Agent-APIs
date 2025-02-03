import { APIFY_TOKEN } from "../consts";

const getDataset = async (datasetId: string) => {
  try {
    const response = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
  
    return data;
  } catch(error) {
    console.error(error)
    return null
  }
};

export default getDataset;
