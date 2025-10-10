'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import { NormalizedProduct } from '@/lib/normalization';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [normalizedData, setNormalizedData] = useState<NormalizedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deactivateMissing, setDeactivateMissing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setNormalizedData([]);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/catalog/import?mode=dry-run', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to preview file.');
      }
      setNormalizedData(result.data);
      toast.success('Preview generated successfully.');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (normalizedData.length === 0) {
      toast.error('Please preview the data before importing.');
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file!);

    const url = `/api/admin/catalog/import?mode=import&deactivateMissing=${deactivateMissing}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to import data.');
      }
      toast.success(result.message);
      setFile(null);
      setNormalizedData([]);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Import Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                  CSV File
                </label>
                <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} />
              </div>
              <Button onClick={handlePreview} disabled={!file || isLoading}>
                {isLoading ? 'Loading...' : 'Preview Data'}
              </Button>
            </CardContent>
          </Card>
          {normalizedData.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Confirm Import</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deactivate-missing"
                    checked={deactivateMissing}
                    onCheckedChange={(checked) => setDeactivateMissing(checked as boolean)}
                  />
                  <label htmlFor="deactivate-missing" className="text-sm font-medium">
                    Deactivate products not in this CSV
                  </label>
                </div>
                <Button onClick={handleImport} disabled={isLoading} className="w-full">
                  {isLoading ? 'Importing...' : `Import ${normalizedData.length} Products`}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Normalized Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {normalizedData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price (VND)</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {normalizedData.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.priceVnd ?? product.priceNote}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.stockStatus}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Upload a file and click &apos;Preview Data&apos; to see the results here.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}