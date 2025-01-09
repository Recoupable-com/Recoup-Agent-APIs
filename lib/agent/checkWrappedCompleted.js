import { STEP_OF_ANALYSIS } from "../step.js";

const checkWrappedCompleted = (funnel_analyses) => {
  const completedAnalysesCount = funnel_analyses.filter(
    (funnel_analysis) =>
      funnel_analysis.status === STEP_OF_ANALYSIS.ERROR ||
      funnel_analysis.status === STEP_OF_ANALYSIS.FINISHED,
  ).length;

  return (
    completedAnalysesCount === funnel_analyses.length &&
    completedAnalysesCount === 4
  );
};

export default checkWrappedCompleted;
