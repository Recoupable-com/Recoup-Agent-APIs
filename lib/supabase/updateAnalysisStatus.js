import supabase from "./serverClient.js";

const updateAnalysisStatus = async (
  chat_id,
  analysis_id,
  funnel_type,
  status,
  progress = 0,
  extra_data = null,
) => {
  if (!analysis_id || !chat_id) return;
  const { data } = await supabase
    .from("funnel_analytics")
    .select("*")
    .eq("id", analysis_id)
    .single();

  const { data: newAnalysis } = await supabase
    .from("funnel_analytics")
    .update({
      ...data,
      status,
    })
    .eq("id", analysis_id)
    .select("*")
    .single();

  global.io.emit(`${chat_id}`, { status, progress, extra_data, funnel_type });
  return newAnalysis;
};

export default updateAnalysisStatus;
