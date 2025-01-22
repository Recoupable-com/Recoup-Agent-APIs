"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_core_1 = require("@stackso/js-core");
const consts_1 = require("../consts");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getStackClient = (pointSystemId = consts_1.CHAT_POINT_SYSTEM_ID) => {
    const stack = new js_core_1.StackClient({
        apiKey: process.env.STACK_KEY,
        pointSystemId,
    });
    return stack;
};
exports.default = getStackClient;
