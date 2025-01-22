"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFormattedProfile = (profile) => {
    return {
        avatar: profile.avatar,
        bio: profile.biography,
        followers: profile.followersCount,
        followings: profile.followingCount,
        name: profile.username,
        nickname: profile.name,
        region: profile.location,
    };
};
exports.default = getFormattedProfile;
