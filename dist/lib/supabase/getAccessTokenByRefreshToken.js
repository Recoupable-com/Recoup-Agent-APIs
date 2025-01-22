"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("../consts");
const getAccessTokenByRefreshToken = async (refreshToken) => {
    try {
        const response = await fetch(`https://accounts.spotify.com/api/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: consts_1.SPOTIFY_CLIENT_ID,
            }),
        });
        const data = await response.json();
        if (!data?.access_token)
            return { error: true };
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
        };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
};
exports.default = getAccessTokenByRefreshToken;
