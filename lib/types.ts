export const CATEGORIES = [
  "Customer Experience",
  "Operations",
  "Digital Banking",
  "AI & Automation",
  "Employee Experience",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Idea = {
  id: string;
  title: string;
  description: string;
  category: Category;
  submitted_by: string;
  votes: number;
  created_at: string;
};
