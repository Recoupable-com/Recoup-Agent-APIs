import supabase from "./serverClient";

const saveAccount = async (accountInfo: any) => {
  const { data } = await supabase
    .from("accounts")
    .insert(accountInfo)
    .select("*")
    .single();

  return data;
};

export default saveAccount;
