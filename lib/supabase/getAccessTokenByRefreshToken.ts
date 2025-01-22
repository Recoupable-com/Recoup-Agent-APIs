import { SPOTIFY_CLIENT_ID } from "../consts";

const getAccessTokenByRefreshToken = async (refreshToken: string) => {
  try {
    const response = await fetch(`https://accounts.spotify.com/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: SPOTIFY_CLIENT_ID,
      }),
    });

    const data = await response.json();
    if (!data?.access_token) return { error: true };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export default getAccessTokenByRefreshToken;
