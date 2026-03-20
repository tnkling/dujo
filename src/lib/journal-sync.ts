import type { Block } from "@/blocks";
import { validateBlocks } from "@/blocks";
import { supabase } from "./supabase";

export async function fetchPageBlocks(
  userId: string,
  pageId: string
): Promise<Block[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("journal_pages")
    .select("blocks")
    .eq("user_id", userId)
    .eq("page_id", pageId)
    .maybeSingle();

  if (error || !data) return null;
  const parsed = data.blocks as unknown;
  return validateBlocks(parsed);
}

export async function savePageBlocks(
  userId: string,
  pageId: string,
  blocks: Block[]
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("journal_pages").upsert(
    {
      user_id: userId,
      page_id: pageId,
      blocks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,page_id" }
  );
  return !error;
}

export async function fetchPageIds(userId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("journal_pages")
    .select("page_id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((r) => r.page_id as string);
}
