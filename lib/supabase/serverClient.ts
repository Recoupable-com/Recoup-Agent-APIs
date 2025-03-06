import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/database.types";
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string;

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
