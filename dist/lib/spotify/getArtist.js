"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getArtist = async (id, accessToken) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok)
            return { error: true };
        const data = await response.json();
        return data;
    }
    catch (error) {
        return { error };
    }
};
exports.default = getArtist;
