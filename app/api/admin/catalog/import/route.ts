import { NextRequest, NextResponse } from 'next/server';
import { normalizeCsvData } from '@/lib/normalization';
import { syncProductsToDb } from '@/lib/sync';
import { logAdminActivity } from '@/lib/audit-log';
import csv from 'csv-parser';

export const runtime = 'nodejs';

const parseCsv = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const readableStream = new (require('stream').Readable)();
    readableStream.push(buffer);
    readableStream.push(null); // End the stream

    readableStream
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: any) => reject(error));
  });
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 },
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'import';
    const deactivateMissing = searchParams.get('deactivateMissing') === 'true';

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let results;
    try {
      results = await parseCsv(fileBuffer);
    } catch (error: any) {
      console.error('Error parsing CSV file:', error);
      return NextResponse.json({ error: 'Failed to parse CSV file.', details: error.message }, { status: 400 });
    }

    let normalizedProducts;
    try {
      normalizedProducts = normalizeCsvData(results);
    } catch (error: any) {
      console.error('Error normalizing CSV data:', error);
      return NextResponse.json({ error: 'Failed to normalize CSV data.', details: error.message }, { status: 400 });
    }

    if (mode === 'dry-run') {
      return NextResponse.json({
        message: 'Dry run successful. Returning normalized data.',
        data: normalizedProducts,
      });
    } else {
      try {
        const syncResult = await syncProductsToDb(normalizedProducts, deactivateMissing);

        const userPayload = JSON.parse(req.headers.get('x-user-payload') || '{}');
        if (userPayload.userId) {
          await logAdminActivity({
            adminUserId: userPayload.userId,
            action: 'import_catalog',
            resourceType: 'Product',
            details: {
              fileName: file.name,
              fileSize: file.size,
              ...syncResult,
            },
          });
        }

        return NextResponse.json({
          message: 'Import successful.',
          ...syncResult,
        });
      } catch (error: any) {
        console.error('Error syncing products to database:', error);
        return NextResponse.json({ error: 'Failed to sync products to database.', details: error.message }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('Error in POST /api/admin/catalog/import:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}