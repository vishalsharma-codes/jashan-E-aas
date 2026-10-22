// >>> ONE LINE TO CHECK <<<
// Point this import at the Supabase client your app already uses
// (the same one your useAuth hook imports). Common paths:
//   "@/lib/supabase"  |  "@/integrations/supabase/client"  |  "@/supabaseClient"
import { supabase as appClient } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Cast to an untyped client so the chat code compiles even if your project
// uses generated Database types that don't know about the chat tables yet.
export const supabase = appClient as unknown as SupabaseClient;
