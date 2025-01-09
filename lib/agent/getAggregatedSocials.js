const getAggregatedSocials = (socialLinks) => {
  const socialLinkMap = new Map();
  socialLinks.forEach((link) => {
    const existingSocial = socialLinkMap.get(link.type);
    const existingLink = existingSocial?.link;
    if (!existingLink) {
      socialLinkMap.set(link.type, link);
    }
  });

  const aggregatedLinks = Array.from(socialLinkMap.values());

  return aggregatedLinks;
};

export default getAggregatedSocials;
