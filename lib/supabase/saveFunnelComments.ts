import supabase from "./serverClient";

const saveFunnelComments = async (comments: any) => {
  const { data } = await supabase
    .from("funnel_analytics_comments")
    .insert(comments)
    .select("*");

  return data;
};

export default saveFunnelComments;
