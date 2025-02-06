import supabase from "./serverClient";

const createReport = async (artistId: string) => {
  try {
    const { data, error } = await supabase
      .from("segment_reports")
      .insert({
        artist_id: artistId,
      })
      .select("*")
      .single();
    if (error) return { error, reportId: null };
    return { reportId: data.id };
  } catch (error) {
    console.error(error);
    return { error, reportId: null };
  }
};

export default createReport;
