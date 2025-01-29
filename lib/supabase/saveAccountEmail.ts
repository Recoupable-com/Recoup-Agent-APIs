import supabase from "./serverClient";

const saveAccountEmail = async (accountEmailsInfo: any) => {
  const { data } = await supabase
    .from("account_emails")
    .insert(accountEmailsInfo)
    .select("*")
    .single();

  return data;
};

export default saveAccountEmail;
