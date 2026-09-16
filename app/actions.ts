"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import {
  BANKS,
  CATEGORIES,
  DEPARTMENTS,
  type BankCode,
  type Category,
  type Department,
} from "@/lib/types";

export type CreateIdeaState = {
  error?: string;
  success?: boolean;
};

const BANK_CODES = BANKS.map((b) => b.code);

export async function createIdea(
  _prevState: CreateIdeaState,
  formData: FormData
): Promise<CreateIdeaState> {
  const name = String(formData.get("submitted_by") ?? "").trim();
  const staffId = String(formData.get("staff_id") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const bank = String(formData.get("bank") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return { error: "Name must be between 2 and 80 characters." };
  }
  if (staffId.length < 2 || staffId.length > 20) {
    return { error: "Staff ID must be between 2 and 20 characters." };
  }
  if (!DEPARTMENTS.includes(department as Department)) {
    return { error: "Please choose a valid department." };
  }
  if (!BANK_CODES.includes(bank as BankCode)) {
    return { error: "Please choose BisB or NBB." };
  }
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
    submitted_by: name,
    staff_id: staffId,
    department,
    bank,
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
