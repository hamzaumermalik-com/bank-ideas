export const CATEGORIES = [
  "Customer Experience",
  "Operations",
  "Digital Banking",
  "AI & Automation",
  "Employee Experience",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DEPARTMENTS = [
  "Retail Banking",
  "Corporate Banking",
  "Operations",
  "IT & Digital",
  "Risk & Compliance",
  "HR & Admin",
  "Marketing & CX",
  "Finance & Treasury",
  "Other",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const BANKS = [
  { code: "BisB", name: "Bahrain Islamic Bank" },
  { code: "NBB", name: "National Bank of Bahrain" },
] as const;

export type BankCode = (typeof BANKS)[number]["code"];

export type Idea = {
  id: string;
  title: string;
  description: string;
  category: Category;
  submitted_by: string;
  staff_id: string | null;
  department: Department | null;
  bank: BankCode | null;
  votes: number;
  created_at: string;
};
