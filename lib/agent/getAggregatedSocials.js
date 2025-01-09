const getAggregatedSocials = (socialLinks) => {
  const socialLinkMap = new Map();
  socialLinks.forEach((link) => {
    if (!socialLinkMap.get(link.type) || link.link) {
      socialLinkMap.set(link.type, link);
    }
  });

  const aggregatedLinks = Array.from(socialLinkMap.values());

  return aggregatedLinks;
};

export default getAggregatedSocials;
