const getArtist = async (id: string, accessToken: string) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) return { error: true };
    const data = await response.json();

    return data;
  } catch (error) {
    return { error };
  }
};

export default getArtist;
