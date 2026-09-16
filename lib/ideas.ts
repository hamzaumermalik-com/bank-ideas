import { supabase } from "@/lib/supabase";
import type { Idea } from "@/lib/types";

export async function getIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load ideas: ${error.message}`);
  }

  return data ?? [];
}
