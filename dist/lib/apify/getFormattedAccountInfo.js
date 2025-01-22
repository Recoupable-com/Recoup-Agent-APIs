"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFormattedAccountInfo = (data) => {
    const aggregatedData = data.reduce((acc, item) => {
        const existingAuthor = acc.find((author) => author.name === item.authorMeta.name);
        if (existingAuthor) {
            existingAuthor.videos.push(item.webVideoUrl);
        }
        else {
            acc.push({
                name: item.authorMeta.name,
                nickname: item.authorMeta.nickName,
                region: item.authorMeta.region,
                avatar: item.authorMeta.avatar,
                bio: item.authorMeta.signature,
                videos: [item.webVideoUrl],
                fans: item.authorMeta.fans,
                following: item.authorMeta.following,
            });
        }
        return acc;
    }, []);
    return Object.values(aggregatedData);
};
exports.default = getFormattedAccountInfo;
