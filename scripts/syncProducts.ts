import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { normalizeCsvData } from '../lib/normalization';
import { syncProductsToDb } from '../lib/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSync(filePath: string, deactivateMissing: boolean = false) {
  console.log(`Starting sync from file: ${filePath}`);
  console.log(`Deactivate missing products: ${deactivateMissing}`);

  const results: any[] = [];
  const stream = fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        console.log(`Read ${results.length} rows from CSV.`);
        const normalizedProducts = normalizeCsvData(results);
        console.log(`Normalized ${normalizedProducts.length} products.`);

        const { deactivatedCount } = await syncProductsToDb(normalizedProducts, deactivateMissing);

        console.log(`Product sync completed.`);
        if (deactivateMissing) {
          console.log(`Deactivated ${deactivatedCount} products.`);
        }
      } catch (e) {
        console.error('An error occurred during the sync process:', e);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  stream.on('error', (error) => {
    console.error('Error reading CSV file:', error);
    process.exit(1);
  });
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a path to the CSV file.');
  process.exit(1);
}
const absoluteFilePath = path.resolve(filePath);
const deactivateMissingFlag = process.argv.includes('--deactivate-missing');

runSync(absoluteFilePath, deactivateMissingFlag);