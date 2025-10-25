/**
 * This script downloads the OpenAPI specs from the Adobe Firefly Services API and saves them to the src/spec directory.
 */

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

// Define the OpenAPI spec URLs to download
import { SPEC_URLS } from './spec-urls.ts';

interface SpecConfig {
  url: string;
  outputPath: string;
}

/**
 * Downloads a JSON file from a URL and saves it to disk
 */
async function downloadSpec(config: SpecConfig): Promise<void> {
  const { url, outputPath } = config;

  console.log(`Fetching spec from: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure the directory exists
    const outputDir = dirname(outputPath);
    await mkdir(outputDir, { recursive: true });

    // Write the file with pretty formatting
    await writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✓ Successfully saved to: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to download ${url}:`, error);
    throw error;
  }
}

/**
 * Main function to download all specs
 */
async function main(): Promise<void> {
  console.log('Starting OpenAPI spec download...\n');

  const results = await Promise.allSettled(SPEC_URLS.map((config) => downloadSpec(config)));

  console.log('\n--- Summary ---');

  let successCount = 0;
  let failCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successCount++;
    } else {
      failCount++;
      console.error(`Failed: ${SPEC_URLS[index].url}`);
    }
  });

  console.log(`Total: ${SPEC_URLS.length} | Success: ${successCount} | Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
