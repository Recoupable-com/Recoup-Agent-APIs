const checkWrappedCompleted = (funnel_analyses) => {
  funnel_analyses.filter((funnel_analysis) => !funnel_analysis.type).length > 0;
};

export default checkWrappedCompleted;
