import OpenAI from "openai";
import { AI_MODEL } from "./consts.js";

const getChatCompletions = async (messages: any, max_tokens = 1111) => {
  try {
    const openai = new OpenAI();
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens,
      temperature: 0.7,
      messages,
    });

    const content = response.choices[0].message?.content?.toString();
    return content || "";
  } catch (error) {
    console.error(error);
    return "";
  }
};

export default getChatCompletions;
