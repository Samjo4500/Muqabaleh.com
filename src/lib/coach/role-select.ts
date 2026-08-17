import type { LabeledOption } from './types';

export type CatalogRole = LabeledOption & {
  category: string;
  industries?: string[];
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** Resolve "Technology" / "التقنية" / "tech" to the canonical category id. */
export function resolveCategoryId(
  value: string,
  categories: LabeledOption[],
): string {
  const raw = value.trim();
  if (!raw) return '';
  const hit = categories.find(
    (c) => c.id === raw || norm(c.en) === norm(raw) || c.ar === raw || norm(c.id) === norm(raw),
  );
  return hit?.id || raw;
}

export function roleMatchesCategory(
  roleCategory: string,
  selectedCategory: string,
  categories: LabeledOption[],
): boolean {
  if (!selectedCategory) return true;
  const selected = resolveCategoryId(selectedCategory, categories);
  const roleCat = resolveCategoryId(roleCategory, categories);
  return Boolean(selected) && roleCat === selected;
}

export function categoriesWithRoles<C extends LabeledOption>(
  categories: C[],
  roles: CatalogRole[],
): C[] {
  return categories.filter((c) =>
    roles.some((r) => roleMatchesCategory(r.category, c.id, categories)),
  );
}

function roleMatchesQuery(role: CatalogRole, query: string): boolean {
  const q = norm(query);
  if (!q) return true;
  return (
    norm(role.en).includes(q) ||
    role.ar.includes(query.trim()) ||
    role.id.includes(q)
  );
}

/**
 * Roles shown in the category picker.
 * Search never empties a category that has roles — unmatched queries fall back
 * to the full category list so the user can still start an interview.
 */
export function rolesForPicker(
  roles: CatalogRole[],
  categories: LabeledOption[],
  selectedCategory: string,
  query: string,
): { roles: CatalogRole[]; usedSearch: boolean; searchMiss: boolean } {
  const inCategory = roles.filter((r) =>
    roleMatchesCategory(r.category, selectedCategory, categories),
  );
  const q = query.trim();
  if (!q) return { roles: inCategory, usedSearch: false, searchMiss: false };
  const searched = inCategory.filter((r) => roleMatchesQuery(r, q));
  if (searched.length > 0) {
    return { roles: searched, usedSearch: true, searchMiss: false };
  }
  return { roles: inCategory, usedSearch: false, searchMiss: inCategory.length > 0 };
}

export function pickInitialRole(
  roles: CatalogRole[],
  categories: LabeledOption[],
  opts: {
    matchedRoleId?: string;
    preferredCategory?: string;
  },
): { categoryId: string; role: CatalogRole | undefined } {
  const matched = opts.matchedRoleId
    ? roles.find((r) => r.id === opts.matchedRoleId)
    : undefined;
  const populated = categoriesWithRoles(categories, roles);
  const preferred = opts.preferredCategory
    ? resolveCategoryId(opts.preferredCategory, categories)
    : '';
  const categoryId =
    matched?.category ||
    (preferred && populated.some((c) => c.id === preferred) ? preferred : '') ||
    populated[0]?.id ||
    categories[0]?.id ||
    roles[0]?.category ||
    '';
  const inCat = roles.filter((r) => roleMatchesCategory(r.category, categoryId, categories));
  return { categoryId, role: matched || inCat[0] || roles[0] };
}
