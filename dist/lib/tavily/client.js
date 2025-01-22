"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@tavily/core");
const tvly = (0, core_1.tavily)({ apiKey: process.env.TAVILY_API_KEY });
exports.default = tvly;
