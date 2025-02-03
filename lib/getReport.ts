import getChatCompletions from "./getChatCompletions";
import { instructions } from "../lib/instructions";
import {
  AI_MODEL,
  FULL_REPORT_NOTE,
  HTML_RESPONSE_FORMAT_INSTRUCTIONS,
  REPORT_NEXT_STEP_NOTE,
} from "../lib/consts";
import OpenAI from "openai";

const getReport = async (context: any) => {
  try {
    const openai = new OpenAI();
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 2222,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `
                Context: ${JSON.stringify(context)}
                Question: Please, create a fan segment report.`,
        },
        {
          role: "system",
          content: `${instructions.get_segements_report}
              ${HTML_RESPONSE_FORMAT_INSTRUCTIONS}
              NOTE: ${FULL_REPORT_NOTE}`,
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(context)}`,
        },
        {
          role: "system",
          content: `${instructions.get_segments_report_next_step}
                ${HTML_RESPONSE_FORMAT_INSTRUCTIONS}
                NOTE: ${REPORT_NEXT_STEP_NOTE}`,
        },
      ],
    });

    console.log("ZIAD HERE", response);
    return {
      nextSteps: "",
      reportContent: "",
    };
  } catch (error) {
    return {
      nextSteps: "",
      reportContent: "",
    };
  }
};

export default getReport;
