"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAggregatedArtist = (funnelAnalyses) => {
    const socialLinks = funnelAnalyses.reduce((acc, fa) => {
        const profile = fa.funnel_analytics_profile?.[0];
        return profile && profile.artists && profile.artists.artist_social_links
            ? acc.concat(profile.artists.artist_social_links)
            : acc;
    }, []);
    const socialLinkMap = new Map();
    socialLinks.forEach((link) => {
        if (!socialLinkMap.get(link.type) || link.link) {
            socialLinkMap.set(link.type, link);
        }
    });
    const aggregatedLinks = Array.from(socialLinkMap.values());
    const { image, name } = funnelAnalyses.reduce((acc, fa) => {
        const profile = fa.funnel_analytics_profile?.[0] || {};
        acc.image = profile.avatar || acc.image || "";
        acc.name = profile.nickname || acc.name || "";
        return acc;
    }, { image: "", name: "" });
    return {
        image,
        name,
        instruction: "",
        label: "",
        artist_social_links: aggregatedLinks,
        bases: [],
        knowledges: [],
    };
};
exports.default = getAggregatedArtist;
