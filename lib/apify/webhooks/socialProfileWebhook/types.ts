import type { TablesInsert } from "@/types/database.types";

export type SocialProfileParserResult = {
  payload: TablesInsert<"socials"> | null;
};

export type SocialProfileParser = (
  datasetItem: unknown
) => Promise<SocialProfileParserResult> | SocialProfileParserResult;
