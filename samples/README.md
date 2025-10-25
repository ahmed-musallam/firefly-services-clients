# Firefly Services Clients - Samples

This directory contains working examples for all Firefly API clients.

## Setup

1. **Install dependencies** (if you haven't already):

   ```bash
   npm install
   ```

2. **Install dotenv for environment variables**:

   ```bash
   npm install dotenv
   ```

3. **Configure your credentials**:

   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env and add your Adobe credentials
   nano .env  # or use your preferred editor
   ```

4. **Get Adobe Credentials**:
   - Go to [Adobe Developer Console](https://developer.adobe.com/console)
   - Create or select a project
   - Add Firefly Services API
   - Create OAuth Server-to-Server credentials
   - Copy your Client ID and Client Secret

## Running Samples

Each sample can be run with `tsx` (TypeScript executor):

```bash
# Image Generation
npx tsx samples/image-generation-sample.ts

# Generate Similar Images
npx tsx samples/generate-similar-sample.ts

# Object Composite
npx tsx samples/object-composite-sample.ts

# Generative Expand
npx tsx samples/generative-expand-sample.ts

# Generative Fill
npx tsx samples/generative-fill-sample.ts

# Video Generation
npx tsx samples/video-generation-sample.ts

# Upload Image
npx tsx samples/upload-image-sample.ts

# Custom Models
npx tsx samples/custom-models-sample.ts
```

## Sample Structure

Each sample demonstrates:

- ✅ Setting up authentication with IMS Client
- ✅ Using environment variables for credentials
- ✅ Making API calls with the specific client
- ✅ Polling for job completion
- ✅ Error handling
- ✅ Displaying results

## Environment Variables

| Variable              | Description                    | Required               |
| --------------------- | ------------------------------ | ---------------------- |
| `ADOBE_CLIENT_ID`     | Your Adobe Client ID (API Key) | Yes                    |
| `ADOBE_CLIENT_SECRET` | Your Adobe Client Secret       | Yes                    |
| `ADOBE_SCOPES`        | Comma-separated scopes         | Yes (default provided) |

## Troubleshooting

### Authentication Errors

If you see authentication errors:

1. Verify your credentials in `.env`
2. Check that your project has Firefly API access enabled
3. Ensure your OAuth credentials are Server-to-Server (not OAuth 2.0)

### Rate Limiting

If you encounter rate limits:

- Wait a few minutes between requests
- Consider implementing retry logic with exponential backoff
- Check your API quota in Adobe Developer Console

### Job Timeout

If jobs timeout:

- Some operations (especially video) can take several minutes
- Increase the `maxAttempts` or `timeoutMs` in polling options
- Check the job status URL manually in your browser

## Additional Resources

- [Adobe Firefly Services Documentation](https://developer.adobe.com/firefly-services/docs/guides/)
- [Adobe Developer Console](https://developer.adobe.com/console)
- [Authentication Guide](https://developer.adobe.com/developer-console/docs/guides/authentication/)
