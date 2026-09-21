import { Request, Response } from 'express';
import { prisma } from '../config/db';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
}

export interface CategoryOption {
  id: string;
  label: string;
  iconName: string;
  gradient: string;
}

export interface CategoryTreeNode extends CategoryRow {
  sortOrder: number;
  subcategories: CategoryRow[];
}

const FALLBACK_ICON_NAME = 'LayoutGrid';

const FALLBACK_GRADIENTS = [
  'from-blue-500/10 to-indigo-500/10',
  'from-amber-500/10 to-orange-500/10',
  'from-pink-500/10 to-rose-500/10',
  'from-emerald-500/10 to-teal-500/10',
  'from-cyan-500/10 to-blue-500/10',
  'from-purple-500/10 to-violet-500/10',
  'from-yellow-500/10 to-amber-500/10',
  'from-indigo-500/10 to-sky-500/10',
];

export function isValidCategoryRow(row: any): row is CategoryRow {
  return Boolean(row) &&
    typeof row.id === 'string' && row.id.length > 0 &&
    typeof row.name === 'string' && row.name.length > 0 &&
    typeof row.slug === 'string' && row.slug.length > 0;
}

export function toCategoryOptions(rows: unknown): CategoryOption[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter(isValidCategoryRow)
    .map((row, index) => ({
      id: row.slug,
      label: row.name,
      iconName: row.icon && row.icon.length > 0 ? row.icon : FALLBACK_ICON_NAME,
      gradient: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
    }));
}

function toCategoryRow(row: any): CategoryRow {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    icon: row.icon ?? null,
    image: row.image ?? null,
  };
}

export function toCategoryTreeNode(row: any): CategoryTreeNode {
  const children = Array.isArray(row?.children) ? row.children.filter(isValidCategoryRow) : [];
  return {
    ...toCategoryRow(row),
    sortOrder: typeof row?.sortOrder === 'number' ? row.sortOrder : 0,
    subcategories: children.map(toCategoryRow),
  };
}

export async function getAll(req: Request, res: Response) {
  try {
    const treeRequested = String(req.query.tree ?? '').toLowerCase() === 'true';

    if (treeRequested) {
      const categories = await prisma.category.findMany({
        where: { parentId: null, isSystem: false },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          children: {
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          },
        },
      });

      return res.status(200).json({
        categories: categories.map(toCategoryTreeNode),
      });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ categories });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching categories' });
  }
}
