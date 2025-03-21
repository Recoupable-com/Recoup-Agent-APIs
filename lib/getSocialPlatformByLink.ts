const getSocialPlatformByLink = (link: string) => {
  if (!link) return "NONE";
  if (link.includes("x.com") || link.includes("twitter.com")) return "TWITTER";
  if (link.includes("instagram.com")) return "INSTAGRAM";
  if (link.includes("spotify.com")) return "SPOTIFY";
  if (link.includes("tiktok.com")) return "TIKTOK";
  return "NONE";
};

export default getSocialPlatformByLink;
