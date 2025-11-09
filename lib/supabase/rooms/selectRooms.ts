import supabase from "../serverClient";

type SelectRoomsParams = {
  account_id: string;
  artist_account_id?: string;
};

export async function selectRooms(params: SelectRoomsParams): Promise<
  {
    id: string;
    account_id: string | null;
    artist_id: string | null;
    topic: string | null;
    updated_at: string;
  }[]
> {
  let query = supabase
    .from("rooms")
    .select("*")
    .order("updated_at", { ascending: false })
    .eq("account_id", params.account_id);

  if (params.artist_account_id) {
    query = query.eq("artist_id", params.artist_account_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch chats: ${error.message}`);
  }

  return data || [];
}
