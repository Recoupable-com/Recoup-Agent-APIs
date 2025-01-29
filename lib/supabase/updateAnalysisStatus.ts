import supabase from "./serverClient.js";

const updateAnalysisStatus = async (
  pilot_id: string | null,
  analysis_id: string,
  funnel_type: string,
  status: number,
  progress = 0,
  extra_data: any = null,
) => {
  if (!analysis_id || !pilot_id) return;
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

  global.io.emit(`${pilot_id}`, { status, progress, extra_data, funnel_type });
  return newAnalysis;
};

export default updateAnalysisStatus;
