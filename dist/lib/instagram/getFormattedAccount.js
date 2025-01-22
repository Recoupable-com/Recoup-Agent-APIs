"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFormattedAccount = (data) => {
    if (data.length === 0 || data?.error)
        return null;
    return {
        profile: {
            nickname: data?.[0]?.fullName || "",
            name: data?.[0]?.username || "",
            bio: data?.[0]?.biography || "",
            followers: data?.[0]?.followersCount || 0,
            followings: data?.[0]?.followersCount || 0,
            avatar: data?.[0]?.profilePicUrl || "",
        },
        latestPosts: data?.[0]?.latestPosts?.map((post) => post.url) || [],
    };
};
exports.default = getFormattedAccount;
