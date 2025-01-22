"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFormattedComments = (data, analysis_id) => {
    const sorteddata = data.sort((a, b) => b?.createTime || 0 - a?.createTime || 0);
    const comments = sorteddata.map((comment) => {
        const { videoWebUrl, text, uniqueId, createTime } = comment;
        return {
            comment: text,
            username: uniqueId,
            post_url: videoWebUrl,
            type: "TIKTOK",
            analysis_id,
            timestamp: new Date(createTime).getTime(),
        };
    });
    return comments;
};
exports.default = getFormattedComments;
