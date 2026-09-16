"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Rocket,
  Sparkles,
} from "lucide-react";
import { createIdea, type CreateIdeaState } from "@/app/actions";
import {
  BANKS,
  CATEGORIES,
  DEPARTMENTS,
  type BankCode,
  type Category,
  type Department,
} from "@/lib/types";
import { CATEGORY_META } from "@/lib/category-meta";
import { DEPARTMENT_META } from "@/lib/department-meta";
import { recordIdeaSubmitted } from "@/lib/game";
import PrizeWheel from "./prize-wheel";

const initialState: CreateIdeaState = {};

const fieldClasses =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-950";
const labelClasses = "text-sm font-medium text-slate-700 dark:text-slate-300";

const STEP_LABELS = ["Your Profile", "Category", "Details", "Review"];
const TOTAL_STEPS = STEP_LABELS.length;

export default function IdeaForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState<Department | "">("");
  const [bank, setBank] = useState<BankCode | "">("");
  const [category, setCategory] = useState<Category | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showWheel, setShowWheel] = useState(false);

  async function submitAndCelebrate(
    prevState: CreateIdeaState,
    formData: FormData
  ): Promise<CreateIdeaState> {
    const result = await createIdea(prevState, formData);
    if (result.success) {
      recordIdeaSubmitted(category || "Unknown");
      setStep(1);
      setName("");
      setStaffId("");
      setDepartment("");
      setBank("");
      setCategory("");
      setTitle("");
      setDescription("");
      setShowWheel(true);
    }
    return result;
  }

  const [state, formAction, pending] = useActionState(
    submitAndCelebrate,
    initialState
  );

  const canProceedFromProfile =
    name.trim().length >= 2 &&
    staffId.trim().length >= 2 &&
    department !== "" &&
    bank !== "";
  const canProceedFromCategory = category !== "";
  const canProceedFromDetails =
    title.trim().length >= 3 && description.trim().length >= 10;

  const canProceed =
    step === 1
      ? canProceedFromProfile
      : step === 2
        ? canProceedFromCategory
        : canProceedFromDetails;

  const heroEmoji = department ? DEPARTMENT_META[department].emoji : "🦸";

  return (
    <>
      {showWheel && <PrizeWheel onDone={() => setShowWheel(false)} />}
      <form
        action={formAction}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              +10 XP on submit
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {STEP_LABELS.map((label, index) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  index < step
                    ? "bg-blue-600"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="department" value={department} />
        <input type="hidden" name="bank" value={bank} />

        {/* Step 1: hero profile */}
        <div className={step === 1 ? "animate-pop-in space-y-4" : "hidden"}>
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-gradient-to-b from-blue-50 to-transparent py-3 dark:from-blue-950/40">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-md ring-4 ring-blue-100 dark:bg-slate-900 dark:ring-blue-900">
              {heroEmoji}
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Create your Ideation Hero
            </p>
            <p className="px-4 text-center text-xs text-slate-500 dark:text-slate-400">
              Every great idea needs a name behind it. Tell us who you are.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="submitted_by" className={labelClasses}>
              Full name
            </label>
            <input
              id="submitted_by"
              name="submitted_by"
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fatima Al Khalifa"
              className={fieldClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="staff_id" className={labelClasses}>
              Staff ID
            </label>
            <input
              id="staff_id"
              name="staff_id"
              type="text"
              required
              minLength={2}
              maxLength={20}
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="e.g. EMP-4521"
              className={fieldClasses}
            />
          </div>

          <div className="space-y-1.5">
            <p className={labelClasses}>Department</p>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Department"
            >
              {DEPARTMENTS.map((d) => {
                const meta = DEPARTMENT_META[d];
                const Icon = meta.icon;
                const selected = department === d;
                return (
                  <button
                    type="button"
                    key={d}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setDepartment(d)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2 py-2 text-left text-xs font-medium transition-all ${
                      selected
                        ? meta.active
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${meta.iconWrap}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">
                      {d}
                    </span>
                    {selected && (
                      <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-current" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className={labelClasses}>Bank</p>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Bank"
            >
              {BANKS.map((b) => {
                const selected = bank === b.code;
                return (
                  <button
                    type="button"
                    key={b.code}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setBank(b.code)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border px-3 py-3 text-center transition-all ${
                      selected
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200 dark:bg-emerald-950 dark:ring-emerald-900"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {b.code}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {b.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: category */}
        <div
          className={step === 2 ? "animate-pop-in space-y-2" : "hidden"}
          role="radiogroup"
          aria-label="Idea category"
        >
          <p className={labelClasses}>Which area does this improve?</p>
          <div className="grid grid-cols-1 gap-2">
            {CATEGORIES.map((c) => {
              const meta = CATEGORY_META[c];
              const Icon = meta.icon;
              const selected = category === c;
              return (
                <button
                  type="button"
                  key={c}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCategory(c)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    selected
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200 dark:bg-blue-950 dark:ring-blue-900"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.iconWrap}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-slate-800 dark:text-slate-100">
                    {c}
                  </span>
                  {selected && (
                    <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: details */}
        <div className={step === 3 ? "animate-pop-in space-y-4" : "hidden"}>
          <div className="space-y-1.5">
            <label htmlFor="title" className={labelClasses}>
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              minLength={3}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Same-day dispute resolution for card fraud"
              className={fieldClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="description" className={labelClasses}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={10}
              maxLength={500}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the problem, and what would you like to see happen?"
              className={`${fieldClasses} resize-none`}
            />
            <p className="text-right text-xs text-slate-400">
              {description.length}/500
            </p>
          </div>
        </div>

        {/* Step 4: review */}
        <div className={step === 4 ? "animate-pop-in space-y-4" : "hidden"}>
          <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <span className="text-base leading-none">{heroEmoji}</span>
              Hero Profile
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {name || "Unnamed hero"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {staffId} · {department} · {bank}
            </p>

            <div className="my-3 border-t border-dashed border-slate-200 dark:border-slate-700" />

            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Idea Preview
            </p>
            {category && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_META[category].badge}`}
              >
                {category}
              </span>
            )}
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              {title || "Untitled idea"}
            </p>
            <p className="mt-1 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>

          {state.error && (
            <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {state.error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => setStep((s) => s + 1)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                "Launching…"
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Launch idea
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
