import { NextRequest, NextResponse } from 'next/server';
import { normalizeCsvData } from '@/lib/normalization';
import { syncProductsToDb } from '@/lib/sync';
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
    const results = await parseCsv(fileBuffer);

    const normalizedProducts = normalizeCsvData(results);

    if (mode === 'dry-run') {
      return NextResponse.json({
        message: 'Dry run successful. Returning normalized data.',
        data: normalizedProducts,
      });
    } else {
      const syncResult = await syncProductsToDb(normalizedProducts, deactivateMissing);
      return NextResponse.json({
        message: 'Import successful.',
        ...syncResult,
      });
    }
  } catch (error: any) {
    console.error('Error in POST /api/admin/catalog/import:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}