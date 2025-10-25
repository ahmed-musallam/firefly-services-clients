/**
 * Sample: Custom Models
 * Demonstrates listing and managing custom Firefly models
 */

import 'dotenv/config';
import { IMSClient } from '@musallam/firefly-services-clients';
import { CustomModelsClient } from '../../src/index';

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  // 2. List custom models
  console.log('\n📋 Fetching custom models...');

  const result = await CustomModelsClient.getCustomModels(
    {
      // Optional: Add query parameters
      // limit: 10,
      // offset: 0,
    },
    { headers: authHeaders }
  );

  // 3. Display results
  console.log('\n✅ Custom models retrieved!');

  const models = result.custom_models || [];
  if (models && models.length > 0) {
    console.log(`\nFound ${models.length} custom model(s):\n`);

    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.displayName || model.assetName || 'Unnamed Model'}`);
      console.log(`   Asset ID: ${model.assetId}`);
      console.log(`   Concept ID: ${model.conceptId || 'N/A'}`);
      console.log(`   Training Mode: ${model.trainingMode || 'N/A'}`);
      console.log(`   Published State: ${model.publishedState || 'N/A'}`);
      console.log('');
    });

    console.log('\n💡 Use these model IDs in your generation requests:');
    console.log('   Example:');
    console.log('   {');
    console.log('     prompt: "your prompt with ' + models[0].conceptId + '",');
    console.log(`     styles: {`);
    console.log(`       reference: {`);
    console.log(`         id: "${models[0].assetId}"`);
    console.log(`       }`);
    console.log(`     }`);
    console.log('   }');
  } else {
    console.log('\nNo custom models found.');
    console.log('\n💡 To create custom models:');
    console.log('   1. Visit https://firefly.adobe.com');
    console.log('   2. Go to Custom Models section');
    console.log('   3. Train your own model with your images');
  }

  // Display pagination info if available
  if (result.total_count !== undefined) {
    console.log(`\n📊 Total models: ${result.total_count}`);
  }
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
