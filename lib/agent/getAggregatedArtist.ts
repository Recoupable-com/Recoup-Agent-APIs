import { SOCIAL } from "../funnels";

const getAggregatedArtist = (funnelAnalyses: any) => {
  const { image, name, socials } = funnelAnalyses.reduce(
    (acc: any, fa: any) => {
      const account_socials =
        fa.funnel_analytics_accounts?.[0]?.accounts?.account_socials;
      if (account_socials.length > 0) {
        acc.image = account_socials[0].avatar || acc.image || "";
        acc.name = account_socials[0].username || acc.name || "";
        acc.socials.concat(account_socials);
      }
      return acc;
    },
    { image: "", name: "", socials: [] },
  );

  const socialLinkMap = new Map();
  socials.forEach((social: SOCIAL) => {
    if (!socialLinkMap.get(social.type) || social.link) {
      socialLinkMap.set(social.type, social);
    }
  });

  const aggregatedSocials = Array.from(socialLinkMap.values());

  return {
    image,
    name,
    instruction: "",
    label: "",
    account_socials: aggregatedSocials,
    knowledges: [],
  };
};

export default getAggregatedArtist;
