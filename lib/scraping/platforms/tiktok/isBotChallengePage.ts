// Check if the response is a bot challenge page
function isBotChallengePage(html: string): boolean {
  // TikTok bot challenge pages are typically short and contain specific patterns
  if (html.length < 2000) {
    return (
      html.includes("verify") ||
      html.includes("challenge") ||
      html.includes("security check") ||
      html.includes("captcha") ||
      html.includes("robot") ||
      html.includes("suspicious activity")
    );
  }
  return false;
}

export default isBotChallengePage;
