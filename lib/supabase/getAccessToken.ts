import getAccessTokenByRefreshToken from "./getAccessTokenByRefreshToken";
import getAdminPresave from "./getAdminPresave";
import supabase from "./serverClient";

const getAccessToken = async () => {
  try {
    const presave = await getAdminPresave();
    if (presave?.error) return { error: presave?.error };
    const refreshToken = presave.refreshToken;
    const tokens = await getAccessTokenByRefreshToken(refreshToken);
    if (tokens?.error) return { error: tokens?.error };
    const { error } = await supabase
      .from("presave")
      .update({
        ...presave,
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
      })
      .eq("id", "admin")
      .select("*")
      .single();
    if (error) return { error };
    return tokens.accessToken;
  } catch (error) {
    return { error };
  }
};

export default getAccessToken;
