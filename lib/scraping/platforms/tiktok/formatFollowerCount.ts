// Format follower count from string to number
function formatFollowerCount(countStr: string | null): number | null {
  if (!countStr) return null;

  // Remove non-numeric characters except for K, M, B
  const cleaned = countStr.replace(/[^0-9.KMB]/gi, "");

  if (!cleaned) return null;

  // Convert K, M, B to actual numbers
  if (cleaned.includes("K")) {
    return parseFloat(cleaned.replace("K", "")) * 1000;
  } else if (cleaned.includes("M")) {
    return parseFloat(cleaned.replace("M", "")) * 1000000;
  } else if (cleaned.includes("B")) {
    return parseFloat(cleaned.replace("B", "")) * 1000000000;
  }

  return parseInt(cleaned, 10) || null;
}

export default formatFollowerCount;
