import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 서버에서는 service_role 키 사용 (RLS 우회)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
