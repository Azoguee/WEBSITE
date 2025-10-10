'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';
import { Product, Category } from '@prisma/client';
import debounce from 'lodash.debounce';

const StockStatus = {
  IN_STOCK: 'IN_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  UNKNOWN: 'UNKNOWN',
} as const;

type ProductWithCategory = Product & { category: { name: string } | null };

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || 'all',
    stockStatus: searchParams.get('stockStatus') || 'all',
    isActive: searchParams.get('isActive') || 'all',
  });
  const [editingProduct, setEditingProduct] = useState<Partial<Product> & { id: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('page', searchParams.get('page') || '1');
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId && filters.categoryId !== 'all') params.set('categoryId', filters.categoryId);
    if (filters.stockStatus && filters.stockStatus !== 'all') params.set('stockStatus', filters.stockStatus);
    if (filters.isActive && filters.isActive !== 'all') params.set('isActive', filters.isActive);

    try {
      const response = await fetch(`/api/admin/catalog/products?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch products.');
      }
      const data = await response.json();
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [searchParams, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/catalog/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast.error('Failed to fetch categories.');
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v);
      else params.delete(k);
    });
    router.push(`/admin/catalog/products?${params.toString()}`);
  };

  const debouncedSearch = useCallback(debounce((value) => handleFilterChange('search', value), 500), []);

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    try {
      const response = await fetch(`/api/admin/catalog/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Update failed');
      const updatedProduct = await response.json();

      setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
      toast.success('Product updated!');
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to update product.');
    }
  };

  const renderEditableCell = (product: ProductWithCategory, field: keyof Product) => {
    if (editingProduct?.id === product.id) {
      if (field === 'isActive') {
        return <Checkbox checked={editingProduct[field] as boolean} onCheckedChange={(checked) => setEditingProduct({...editingProduct, [field]: checked})} />;
      }
       if (field === 'stockStatus') {
        return (
          <Select value={editingProduct[field] as string} onValueChange={(value) => setEditingProduct({...editingProduct, [field]: value})}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              {Object.values(StockStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      }
      return <Input defaultValue={editingProduct[field] as any} onChange={(e) => setEditingProduct({...editingProduct, [field]: e.target.value})} />;
    }
    return product[field]?.toString() ?? '';
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
      <div className="flex space-x-4 mb-4">
        <Input placeholder="Search by name or SKU..." defaultValue={filters.search} onChange={(e) => debouncedSearch(e.target.value)} />
        <Select value={filters.categoryId} onValueChange={(v) => handleFilterChange('categoryId', v)}>
          <SelectTrigger><SelectValue placeholder="Filter by category..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.stockStatus} onValueChange={(v) => handleFilterChange('stockStatus', v)}>
          <SelectTrigger><SelectValue placeholder="Filter by stock..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(StockStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
         <Select value={filters.isActive} onValueChange={(v) => handleFilterChange('isActive', v)}>
          <SelectTrigger><SelectValue placeholder="Filter by active..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price (VND)</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{renderEditableCell(p, 'name')}</TableCell>
              <TableCell>{renderEditableCell(p, 'sku')}</TableCell>
              <TableCell>{renderEditableCell(p, 'priceVnd')}</TableCell>
              <TableCell>{p.category?.name}</TableCell>
              <TableCell>{renderEditableCell(p, 'stockStatus')}</TableCell>
              <TableCell>{editingProduct?.id === p.id ? renderEditableCell(p, 'isActive') : p.isActive.toString()}</TableCell>
              <TableCell>
                {editingProduct?.id === p.id ? (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleUpdateProduct(p.id, editingProduct)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setEditingProduct(p)}>Edit</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Add pagination controls */}
    </div>
  );
}