import getChatCompletions from "./getChatCompletions";
import { instructions } from "../lib/instructions";
import {
  FULL_REPORT_NOTE,
  HTML_RESPONSE_FORMAT_INSTRUCTIONS,
  REPORT_NEXT_STEP_NOTE,
} from "../lib/consts";

const getReport = async (context: any) => {
  try {
    let reportContent = "";
    while (1) {
      reportContent = await getChatCompletions([
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
      ]);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (reportContent) break;
    }

    let nextSteps = "";
    while (1) {
      nextSteps = await getChatCompletions([
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
      ]);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (nextSteps) break;
    }

    return {
      nextSteps,
      reportContent,
    };
  } catch (error) {
    return {
      nextSteps: "",
      reportContent: "",
    };
  }
};

export default getReport;
