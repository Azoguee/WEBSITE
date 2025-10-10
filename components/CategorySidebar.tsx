
import { prisma } from '@/lib/db'
import { Category } from '@/types'
import Link from 'next/link'

async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function CategorySidebar() {
  const categories = await getCategories()

  return (
    <aside className="w-full lg:w-64 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Danh mục</h2>
      <nav className="space-y-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/danh-muc/${category.name}`}
            className="block font-medium text-gray-700 hover:text-primary-600 transition-colors"
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
