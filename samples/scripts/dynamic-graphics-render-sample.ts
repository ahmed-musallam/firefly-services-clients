import {
  DynamicGraphicsRenderClient,
  pollDynamicGraphicsJob,
} from '@musallam/dynamic-graphics-render-client';
import { IMSClient } from '@musallam/ims-client';
import 'dotenv/config';
import { TemplateRenderRequestVariationsItemElementsItemControlsItem } from '../../packages/dynamic-graphics-render-client/dist/generated/dynamic-graphics-render-client';

// Configuration
const TEMPLATE_URL = process.env.DGR_TEMPLATE_URL || 'https://example.com/templates/sample.mogrt';
const LOGO_URL = process.env.DGR_LOGO_URL || 'https://example.com/media/logo.png';

async function setupAuth() {
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  return authHeaders;
}

/**
 * Example 1: Get available rendering presets
 */
async function getPresetsExample(authHeaders: Record<string, string>) {
  console.log('\n--- Getting Available Presets ---');

  const presets = await DynamicGraphicsRenderClient.getPresets({ headers: authHeaders });

  console.log(`\nFound ${presets.items.length} presets:\n`);
  presets.items.forEach((preset) => {
    console.log(`${preset.label} (${preset.presetId})`);
    console.log(`  Codec: ${preset.codec} ${preset.profile || ''}`);
    console.log(
      `  Bitrate: ${preset.targetBitrateInKbps}kbps (max: ${preset.maxBitrateInKbps}kbps)`
    );
    console.log(`  FPS: ${preset.maxFps.numerator}/${preset.maxFps.denominator}`);
    console.log(`  Alpha: ${preset.alpha ? 'Yes' : 'No'}`);
    console.log(`  Use case: ${preset.primaryUsage}`);
    console.log('');
  });
}

/**
 * Example 2: Inspect a template to discover its structure
 */
async function describeTemplateExample(authHeaders: Record<string, string>) {
  console.log('\n--- Describing Template ---');

  const describeJob = await DynamicGraphicsRenderClient.templateDescribe(
    {
      source: {
        url: TEMPLATE_URL,
      },
      type: 'mogrt',
    },
    { headers: authHeaders }
  );

  console.log('Job ID:', describeJob.jobId);
  console.log('Status URL:', describeJob.statusUrl);

  const result = await pollDynamicGraphicsJob(describeJob, {
    axiosRequestConfig: { headers: authHeaders },
    onProgress: (status) => {
      console.log(`  Status: ${status.status}`);
      if (status.percentCompleted) {
        console.log(`  Progress: ${status.percentCompleted}%`);
      }
    },
  });

  console.log('\nTemplate Information:');

  // Display fonts
  if (result.output?.fonts) {
    console.log('\nFonts:');
    result.output.fonts.forEach((font) => {
      console.log(
        `  - ${font.name} ${font.uploadRequired ? '(upload required)' : '(system font)'}`
      );
    });
  }

  // Display elements and controls
  if (result.output?.elements) {
    console.log('\nElements and Controls:');
    result.output.elements.forEach((element, idx) => {
      console.log(`\nElement ${idx + 1} (${element.id}):`);
      element.controls?.forEach((control) => {
        console.log(`  - ${control.label || 'Unlabeled'} (${control.type})`);
        console.log(`    ID: ${control.id}`);

        if (control.type === 'text' && control.data && 'text' in control.data) {
          console.log(`    Current text: "${control.data.text}"`);
          if ('font' in control.data && control.data.font) {
            console.log(`    Font: ${control.data.font.name}`);
          }
        } else if (control.type === 'media') {
          console.log(`    Media slot`);
          if (control.possibleScaleValues) {
            console.log(`    Scale options: ${control.possibleScaleValues.join(', ')}`);
          }
        } else if (control.type === 'dropdown' && control.options) {
          console.log(`    Options: ${JSON.stringify(control.options)}`);
        }
      });
    });
  }

  return result;
}

/**
 * Example 3: Render a template with custom content
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function renderTemplateExample(authHeaders: Record<string, string>) {
  console.log('\n--- Rendering Template ---');

  // First, describe the template to get element/control IDs
  console.log('Step 1: Inspecting template...');
  const templateInfo = await describeTemplateExample(authHeaders);

  // Extract the first element ID (you'd use real IDs from the describe response)
  const firstElement = templateInfo.output?.elements?.[0];
  if (!firstElement) {
    console.log('No elements found in template');
    return;
  }

  console.log('\nStep 2: Rendering template with custom content...');

  // Build controls array with proper types based on the describe response
  const controls: TemplateRenderRequestVariationsItemElementsItemControlsItem[] = [];

  // Find text controls and customize them
  const textControl = firstElement.controls?.find((c) => c.type === 'text');
  if (textControl && textControl.id) {
    controls.push({
      id: textControl.id,
      label: textControl.label,
      type: 'text',
      data: {
        text: 'Custom Title Text!',
        font: {
          name: 'Arial',
        },
      },
    });
  }

  // Find media controls and customize them
  const mediaControl = firstElement.controls?.find((c) => c.type === 'media');
  if (mediaControl && mediaControl.id) {
    controls.push({
      id: mediaControl.id,
      label: mediaControl.label,
      type: 'media',
      data: {
        name: 'logo.png',
        mediaType: 'image/png',
        source: {
          url: LOGO_URL,
        },
      },
      scale: 'fit_to_frame',
    });
  }

  const renderJob = await DynamicGraphicsRenderClient.templateRender(
    {
      source: {
        url: TEMPLATE_URL,
      },
      type: 'mogrt',

      // Add custom fonts if needed
      fonts: [
        {
          name: 'Arial',
          source: {
            url: 'https://example.com/fonts/arial.ttf',
          },
        },
      ],

      config: {
        handleMissingFonts: 'use_default', // or 'fail' to error on missing fonts
      },

      variations: [
        {
          id: 'variation-1',
          presetIds: ['ffs_video_api_vert_1920p_hq'], // Vertical video for social media
          elements: [
            {
              id: firstElement.id,
              type: 'mogrt',
              controls,
            },
          ],
        },
      ],
    },
    { headers: authHeaders }
  );

  console.log('Render Job ID:', renderJob.jobId);

  const result = await pollDynamicGraphicsJob(renderJob, {
    axiosRequestConfig: { headers: authHeaders },
    intervalMs: 3000, // Poll every 3 seconds
    timeoutMs: 300000, // 5 minute timeout
    onProgress: (status) => {
      console.log(`  Status: ${status.status}`);
      if (status.percentCompleted) {
        console.log(`  Progress: ${status.percentCompleted}%`);
      }
    },
  });

  console.log('\nRender Complete!');

  if (result.outputs && result.outputs.length > 0) {
    console.log('\nRendered Videos:');
    result.outputs.forEach((output) => {
      console.log(`\nVariation ${output.variationId}:`);
      console.log(`  Preset: ${output.presetId}`);
      console.log(`  Download URL: ${output.destination.url}`);
    });
  }

  if (result.status === 'partially_succeeded' && result.errors) {
    console.warn('\n⚠️  Some variations failed:');
    result.errors.forEach((error) => {
      console.warn(`  Variation ${error.variationId} (${error.presetId}):`);
      console.warn(`    ${error.error.message}`);
    });
  }
}

/**
 * Example 4: Render multiple variations with different presets
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function renderMultipleVariationsExample(authHeaders: Record<string, string>) {
  console.log('\n--- Rendering Multiple Variations ---');

  const templateInfo = await describeTemplateExample(authHeaders);
  const firstElement = templateInfo.output?.elements?.[0];

  if (!firstElement) {
    console.log('No elements found in template');
    return;
  }

  // Build controls for variation 1
  const textControl = firstElement.controls?.find((c) => c.type === 'text');
  const controls1: TemplateRenderRequestVariationsItemElementsItemControlsItem[] =
    textControl && textControl.id
      ? [
          {
            id: textControl.id,
            type: 'text',
            data: { text: 'Social Media Version' },
          },
        ]
      : [];

  // Build controls for variation 2
  const controls2: TemplateRenderRequestVariationsItemElementsItemControlsItem[] =
    textControl && textControl.id
      ? [
          {
            id: textControl.id,
            type: 'text',
            data: { text: 'YouTube Version' },
          },
        ]
      : [];

  const renderJob = await DynamicGraphicsRenderClient.templateRender(
    {
      source: {
        url: TEMPLATE_URL,
      },
      type: 'mogrt',
      config: {
        handleMissingFonts: 'use_default',
      },
      variations: [
        // Variation 1: Vertical video
        {
          id: 'social-vertical',
          presetIds: ['ffs_video_api_vert_1920p_hq'],
          elements: [
            {
              id: firstElement.id,
              type: 'mogrt',
              controls: controls1,
            },
          ],
        },
        // Variation 2: Landscape video
        {
          id: 'youtube-landscape',
          presetIds: ['ffs_video_api_land_1080p_hq'],
          elements: [
            {
              id: firstElement.id,
              type: 'mogrt',
              controls: controls2,
            },
          ],
        },
      ],
    },
    { headers: authHeaders }
  );

  const result = await pollDynamicGraphicsJob(renderJob, {
    axiosRequestConfig: { headers: authHeaders },
    onProgress: (status) => {
      console.log(`Status: ${status.status}, Progress: ${status.percentCompleted || 0}%`);
    },
  });

  console.log('\nAll variations rendered:');
  result.outputs?.forEach((output) => {
    console.log(`- ${output.variationId}: ${output.destination.url}`);
  });
}

async function main() {
  const authHeaders = await setupAuth();

  // Run examples
  await getPresetsExample(authHeaders);
  // await describeTemplateExample(authHeaders);
  // await renderTemplateExample(authHeaders);
  // await renderMultipleVariationsExample(authHeaders);
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
