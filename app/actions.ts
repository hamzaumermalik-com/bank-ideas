"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, type Category } from "@/lib/types";

export type CreateIdeaState = {
  error?: string;
  success?: boolean;
};

export async function createIdea(
  _prevState: CreateIdeaState,
  formData: FormData
): Promise<CreateIdeaState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const submittedBy = String(formData.get("submitted_by") ?? "").trim();

  if (title.length < 3 || title.length > 120) {
    return { error: "Title must be between 3 and 120 characters." };
  }
  if (description.length < 10 || description.length > 500) {
    return { error: "Description must be between 10 and 500 characters." };
  }
  if (!CATEGORIES.includes(category as Category)) {
    return { error: "Please choose a valid category." };
  }

  const { error } = await supabase.from("ideas").insert({
    title,
    description,
    category,
    submitted_by: submittedBy || "Anonymous",
  });

  if (error) {
    return {
      error: "Something went wrong saving your idea. Please try again.",
    };
  }

  revalidatePath("/");
  return { success: true };
}

export async function voteIdea(id: string) {
  const { error } = await supabase.rpc("increment_idea_vote", {
    idea_id: id,
  });

  if (error) {
    throw new Error("Failed to register vote.");
  }

  revalidatePath("/");
}
