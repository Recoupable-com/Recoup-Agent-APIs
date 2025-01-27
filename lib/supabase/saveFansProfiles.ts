import supabase from "./serverClient";

const saveFansProfiles = async (profiles: any) => {
  const { data } = await supabase
    .from("fans_segments")
    .insert(profiles)
    .select("*")
    .single();

  return data;
};

export default saveFansProfiles;
