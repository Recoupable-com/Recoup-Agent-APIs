type GenerateAccessTokenResult =
  | {
      access_token: string;
      token_type: string;
      expires_in: number;
      error: null;
    }
  | { access_token: null; token_type: null; expires_in: null; error: Error };

const generateAccessToken = async (): Promise<GenerateAccessTokenResult> => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return {
      access_token: null,
      token_type: null,
      expires_in: null,
      error: new Error(
        "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment"
      ),
    };
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      return {
        access_token: null,
        token_type: null,
        expires_in: null,
        error: new Error(`Spotify token request failed: ${response.status}`),
      };
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      error: null,
    };
  } catch (error) {
    return {
      access_token: null,
      token_type: null,
      expires_in: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error generating access token"),
    };
  }
};

export default generateAccessToken;
