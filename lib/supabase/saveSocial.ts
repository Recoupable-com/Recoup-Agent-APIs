import supabase from "./serverClient";

const saveSocial = async (socialInfo: any) => {
  const { data } = await supabase
    .from("account_socials")
    .insert(socialInfo)
    .select("*")
    .single();

  return data;
};

export default saveSocial;
