import { StackClient } from "@stackso/js-core";
import { CHAT_POINT_SYSTEM_ID } from "../consts";
import dotenv from "dotenv";

dotenv.config();

const getStackClient = (pointSystemId = CHAT_POINT_SYSTEM_ID) => {
  const stack = new StackClient({
    apiKey: process.env.STACK_KEY as string,
    pointSystemId,
  });

  return stack;
};

export default getStackClient;
