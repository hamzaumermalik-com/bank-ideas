import { CATEGORY_META } from "@/lib/category-meta";
import type { Category } from "@/lib/types";

export default function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.badge}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {category}
    </span>
  );
}
