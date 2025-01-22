"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFormattedCommentsInfo = (data) => {
    let totalComments = 0;
    const aggregated = {};
    const sorteddata = data.sort((a, b) => b?.createTime || 0 - a?.createTime || 0);
    sorteddata.forEach((comment) => {
        const { videoWebUrl, text, uniqueId, createTime } = comment;
        if (!aggregated[videoWebUrl]) {
            aggregated[videoWebUrl] = {
                videoWebUrl,
                comments: [],
            };
        }
        if (text) {
            totalComments++;
            aggregated[videoWebUrl].comments.push({
                comment: text,
                username: uniqueId,
                created_at: createTime,
            });
        }
    });
    return {
        videos: Object.values(aggregated),
        totalComments,
    };
};
exports.default = getFormattedCommentsInfo;
