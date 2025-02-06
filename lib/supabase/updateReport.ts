import supabase from "./serverClient";

const updateReport = async (
  reportId: string,
  report: string,
  next_steps: string,
) => {
  try {
    const { data: existingReport, error: existingError } = await supabase
      .from("segment_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (existingError) return { report: null, error: existingError };

    const { data, error } = await supabase.from("segment_reports").update({
      ...existingReport,
      report,
      next_steps,
    });

    return { report: data, error };
  } catch (error) {
    console.error(error);
    return { error, report: null };
  }
};

export default updateReport;
