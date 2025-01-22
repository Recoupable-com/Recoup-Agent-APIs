"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const step_1 = require("../step");
const checkWrappedCompleted = (funnel_analyses) => {
    const completedAnalysesCount = funnel_analyses.filter((funnel_analysis) => funnel_analysis.status === step_1.STEP_OF_ANALYSIS.ERROR ||
        funnel_analysis.status === step_1.STEP_OF_ANALYSIS.FINISHED).length;
    return (completedAnalysesCount === funnel_analyses.length &&
        completedAnalysesCount === 4);
};
exports.default = checkWrappedCompleted;
