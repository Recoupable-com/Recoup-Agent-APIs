import supabase from "./serverClient.js";

const updateAnalysisStatus = async (
  pilot_id: string | null,
  analysis_id: string,
  funnel_type: string,
  status: number,
  progress = 0,
  extra_data: any = null
) => {
  if (!analysis_id || !pilot_id) return;

  // Update agent_status table instead of funnel_analytics
  const { data: newAnalysis } = await supabase
    .from("agent_status")
    .update({
      status,
      progress,
    })
    .eq("id", analysis_id)
    .select("*")
    .single();

  // Still emit the event for real-time updates
  global.io.emit(`${pilot_id}`, { status, progress, extra_data, funnel_type });
  return newAnalysis;
};

export default updateAnalysisStatus;
