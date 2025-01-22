import getChatCompletions from "./getChatCompletions";
import tvly from "./tavily/client";

const getSocialHandles = async (handle: string) => {
  try {
    const socials = ["tiktok", "instagram", "twitter", "spotify"];
    const answers: any = [];
    const handlesPromise = socials.map(async (social) => {
      const query = `What is ${social} handle for ${handle}?`;
      const response = await tvly.search(query, {
        includeDomains: [`${social === "twitter" ? "x" : social}.com`],
        searchDepth: "advanced",
        maxResults: 10,
        includeAnswer: true,
        maxTokens: 1111,
      });
      answers.push(`${social.toUpperCase()}: ${response.answer}`);
    });

    await Promise.all(handlesPromise);

    const content = await getChatCompletions(
      [
        {
          role: "user",
          content: `
        Context: ${JSON.stringify(answers)}
        Instruction: 
          Let me know the tiktok, instagram, twitter, spotify handles in the given context.
          Don't use handle_not_available.
          If handle is not available, use given username as-is.`,
        },
        {
          role: "system",
          content: `Response should be in JSON format. {"data": {"twitter": string, "instagram": string, "spotify": string, "tiktok": string}}.`,
        },
      ],
      1111,
    );

    const handles = JSON.parse(
      content?.replace(/\n/g, "")?.replace(/json/g, "")?.replace(/```/g, ""),
    )?.data || {
      twitter: "",
      instagram: "",
      spotify: "",
      tiktok: "",
    };

    return handles;
  } catch (error) {
    console.error(error);
    return {
      twitter: "",
      instagram: "",
      spotify: "",
      tiktok: "",
    };
  }
};

export default getSocialHandles;
