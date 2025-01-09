import { STEP_OF_ANALYSIS } from "../step.js";

const checkWrappedCompleted = (funnel_analyses) => {
  const completedAnalysesCnt = funnel_analyses.filter(
    (funnel_analysis) =>
      funnel_analysis.status === STEP_OF_ANALYSIS.ERROR ||
      funnel_analysis.status === STEP_OF_ANALYSIS.FINISHED,
  ).length;

  return (
    completedAnalysesCnt === funnel_analyses.length &&
    completedAnalysesCnt === 4
  );
};

export default checkWrappedCompleted;
