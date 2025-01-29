import supabase from "./serverClient";

const saveFanSegment = async (fanSegment: any) => {
  const { data } = await supabase
    .from("fan_segment")
    .insert(fanSegment)
    .select("*")
    .single();

  return data;
};

export default saveFanSegment;
