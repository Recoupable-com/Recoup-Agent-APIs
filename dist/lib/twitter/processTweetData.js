"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stats = {
    requestCount: 0,
    rateLimitHits: 0,
    retriesCount: 0,
    uniqueTweets: 0,
    fallbackCount: 0,
    startTime: Date.now(),
    oldestTweetDate: null,
    newestTweetDate: null,
    fallbackUsed: false,
};
const processTweetData = (tweet) => {
    try {
        if (!tweet || !tweet.id)
            return null;
        let timestamp = tweet.timestamp;
        if (!timestamp) {
            timestamp = tweet.timeParsed?.getTime();
        }
        if (!timestamp)
            return null;
        if (timestamp < 1e12)
            timestamp *= 1000;
        if (isNaN(timestamp) || timestamp <= 0) {
            return null;
        }
        const tweetDate = new Date(timestamp);
        if (!stats.oldestTweetDate || tweetDate < stats.oldestTweetDate) {
            stats.oldestTweetDate = tweetDate;
        }
        if (!stats.newestTweetDate || tweetDate > stats.newestTweetDate) {
            stats.newestTweetDate = tweetDate;
        }
        return {
            id: tweet.id,
            text: tweet.text,
            username: tweet.username,
            timestamp,
            createdAt: new Date(timestamp).toISOString(),
            isReply: Boolean(tweet.isReply),
            isRetweet: Boolean(tweet.isRetweet),
            likes: tweet.likes || 0,
            retweetCount: tweet.retweets || 0,
            replies: tweet.replies || 0,
            photos: tweet.photos || [],
            videos: tweet.videos || [],
            urls: tweet.urls || [],
            permanentUrl: tweet.permanentUrl,
            quotedStatusId: tweet.quotedStatusId,
            inReplyToStatusId: tweet.inReplyToStatusId,
            hashtags: tweet.hashtags || [],
        };
    }
    catch (error) {
        return null;
    }
};
exports.default = processTweetData;
