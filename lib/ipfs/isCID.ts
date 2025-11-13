import { CID } from "multiformats/cid";

export default function isCID(str: string | null | undefined): boolean {
  if (!str) return false;

  try {
    CID.parse(str);
    return true;
  } catch (e) {
    console.error("Error parsing CID:", e);
    if (/^(bafy|Qm)/.test(str)) return true;
    return false;
  }
}
