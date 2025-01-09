import getChatCompletions from "./getChatCompletions.js";
import { instructions } from "./instructions.js";

const getSegments = async (context) => {
  try {
    const content = await getChatCompletions(
      [
        {
          role: "user",
          content: `Context: ${JSON.stringify(context)}`,
        },
        {
          role: "system",
          content: `${instructions.get_fan_segments} \n Response should be in JSON format. {"data": [{ "string": number }, { "string": number }]}.`,
        },
      ],
      2222,
    );

    if (content)
      return (
        JSON.parse(
          content
            ?.replaceAll("\n", "")
            ?.replaceAll("json", "")
            ?.replaceAll("```", ""),
        )?.data || []
      );
    throw new Error("No content received from OpenAI");
  } catch (error) {
    throw new Error("API request failed");
  }
};

export default getSegments;
