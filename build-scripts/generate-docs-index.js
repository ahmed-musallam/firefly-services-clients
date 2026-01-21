#!/usr/bin/env node

/**
 * Generates a unified landing page for all package documentation
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const docsDir = join(rootDir, 'typedoc');

// Ensure typedoc directory exists
mkdirSync(docsDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adobe Services Clients - API Documentation</title>
    <style>
        :root {
            --primary-color: #eb1000;
            --secondary-color: #fa0f00;
            --text-color: #2c2c2c;
            --bg-color: #ffffff;
            --card-bg: #f5f5f5;
            --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            --hover-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Adobe Clean', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
        }

        header {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: var(--shadow);
        }

        header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        header p {
            font-size: 1.2rem;
            opacity: 0.95;
        }

        main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 3rem 2rem;
        }

        .intro {
            text-align: center;
            margin-bottom: 3rem;
        }

        .intro h2 {
            font-size: 1.8rem;
            margin-bottom: 1rem;
            color: var(--text-color);
        }

        .intro p {
            font-size: 1.1rem;
            color: #666;
            max-width: 700px;
            margin: 0 auto;
        }

        .packages {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .package-card {
            background: var(--card-bg);
            border-radius: 8px;
            padding: 2rem;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
            text-decoration: none;
            color: var(--text-color);
            display: flex;
            flex-direction: column;
        }

        .package-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--hover-shadow);
        }

        .package-card h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--primary-color);
        }

        .package-card .package-name {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 1rem;
            padding: 0.25rem 0.5rem;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
            display: inline-block;
        }

        .package-card p {
            flex: 1;
            margin-bottom: 1.5rem;
            color: #555;
        }

        .package-card .cta {
            display: inline-flex;
            align-items: center;
            font-weight: 600;
            color: var(--primary-color);
        }

        .package-card .cta::after {
            content: '→';
            margin-left: 0.5rem;
            transition: margin-left 0.3s ease;
        }

        .package-card:hover .cta::after {
            margin-left: 1rem;
        }

        .resources {
            background: var(--card-bg);
            border-radius: 8px;
            padding: 2rem;
            margin-top: 3rem;
        }

        .resources h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: var(--text-color);
        }

        .resources ul {
            list-style: none;
        }

        .resources li {
            margin-bottom: 1rem;
        }

        .resources a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .resources a:hover {
            color: var(--secondary-color);
            text-decoration: underline;
        }

        footer {
            text-align: center;
            padding: 2rem;
            color: #666;
            border-top: 1px solid #e0e0e0;
            margin-top: 3rem;
        }

        .badge {
            display: inline-block;
            background: var(--primary-color);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }

        @media (max-width: 768px) {
            header h1 {
                font-size: 2rem;
            }

            header p {
                font-size: 1rem;
            }

            .packages {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>🔥 Adobe Services Clients</h1>
        <p>TypeScript Client Libraries for Adobe Creative Cloud APIs</p>
    </header>

    <main>
        <div class="intro">
            <h2>API Documentation</h2>
            <p>
                Comprehensive TypeScript documentation for all Adobe services client libraries.
                Each package provides type-safe access to Adobe's powerful APIs.
            </p>
        </div>

        <div class="packages">
            <a href="./firefly-client/" class="package-card">
                <h3>Firefly Client <span class="badge">AI</span></h3>
                <div class="package-name">@musallam/firefly-client</div>
                <p>
                    Complete TypeScript client for Adobe Firefly generative AI APIs.
                    Generate images, expand images, fill images, generate videos, and more with type-safe interfaces.
                </p>
                <span class="cta">View Documentation</span>
            </a>

            <a href="./photoshop-client/" class="package-card">
                <h3>Photoshop Client <span class="badge">Editing</span></h3>
                <div class="package-name">@musallam/photoshop-client</div>
                <p>
                    TypeScript client for Adobe Photoshop APIs.
                    Automate Photoshop operations, generate masks, remove backgrounds, and manipulate images programmatically.
                </p>
                <span class="cta">View Documentation</span>
            </a>

            <a href="./@musallam/storage-and-collaboration-client/" class="package-card">
                <h3>Storage & Collaboration Client <span class="badge">Storage</span></h3>
                <div class="package-name">@musallam/storage-and-collaboration-client</div>
                <p>
                    TypeScript client for Adobe Cloud Storage and Collaboration APIs.
                    Manage projects, folders, files, permissions, and collaborate on cloud content.
                </p>
                <span class="cta">View Documentation</span>
            </a>

            <a href="./lightroom-client/" class="package-card">
                <h3>Lightroom Client <span class="badge">Photo Editing</span></h3>
                <div class="package-name">@musallam/lightroom-client</div>
                <p>
                    TypeScript client for Adobe Lightroom APIs.
                    Apply presets, XMP settings, auto-tone, auto-straighten, and manual edits to photos programmatically.
                </p>
                <span class="cta">View Documentation</span>
            </a>

            <a href="./dynamic-graphics-render-client/" class="package-card">
                <h3>Dynamic Graphics Render Client <span class="badge">Video</span></h3>
                <div class="package-name">@musallam/dynamic-graphics-render-client</div>
                <p>
                    TypeScript client for Adobe Dynamic Graphics Render APIs.
                    Inspect and render Motion Graphics Templates (.mogrt) with dynamic content, text, and media.
                </p>
                <span class="cta">View Documentation</span>
            </a>

            <a href="./ims-client/" class="package-card">
                <h3>IMS Client <span class="badge">Auth</span></h3>
                <div class="package-name">@musallam/ims-client</div>
                <p>
                    Authentication client for Adobe Identity Management Services (IMS).
                    Handle OAuth flows, manage access tokens, and authenticate with Adobe services.
                </p>
                <span class="cta">View Documentation</span>
            </a>
        </div>

        <div class="resources">
            <h2>📚 Additional Resources</h2>
            <ul>
                <li>
                    <strong>GitHub Repository:</strong>
                    <a href="https://github.com/ahmed-musallam/adobe-services-clients" target="_blank" rel="noopener">
                        ahmed-musallam/adobe-services-clients
                    </a>
                </li>
                <li>
                    <strong>Installation:</strong>
                    <code>npm install @musallam/firefly-client @musallam/photoshop-client @musallam/lightroom-client @musallam/dynamic-graphics-render-client @musallam/storage-and-collaboration-client @musallam/ims-client</code>
                </li>
                <li>
                    <strong>Adobe Firefly API:</strong>
                    <a href="https://developer.adobe.com/firefly-services/docs/guides/" target="_blank" rel="noopener">
                        Official Documentation
                    </a>
                </li>
                <li>
                    <strong>Adobe Photoshop API:</strong>
                    <a href="https://developer.adobe.com/photoshop/photoshop-api-docs/" target="_blank" rel="noopener">
                        Official Documentation
                    </a>
                </li>
                <li>
                    <strong>Adobe Cloud Storage API:</strong>
                    <a href="https://developer.adobe.com/apis/storage/" target="_blank" rel="noopener">
                        Official Documentation
                    </a>
                </li>
                <li>
                    <strong>Adobe Lightroom API:</strong>
                    <a href="https://developer.adobe.com/firefly-services/docs/lightroom/" target="_blank" rel="noopener">
                        Official Documentation
                    </a>
                </li>
                <li>
                    <strong>Adobe Dynamic Graphics Render API:</strong>
                    <a href="https://developer.adobe.com/firefly-services/docs/" target="_blank" rel="noopener">
                        Official Documentation
                    </a>
                </li>
                <li>
                    <strong>Adobe IMS:</strong>
                    <a href="https://developer.adobe.com/developer-console/docs/guides/authentication/" target="_blank" rel="noopener">
                        Authentication Guide
                    </a>
                </li>
            </ul>
        </div>
    </main>

    <footer>
        <p>Built with ❤️ using TypeDoc and Nx</p>
        <p>© ${new Date().getFullYear()} - Adobe Services Clients</p>
    </footer>
</body>
</html>
`;

const indexPath = join(docsDir, 'index.html');
writeFileSync(indexPath, html, 'utf-8');

console.log('✅ Generated unified docs landing page at typedoc/index.html');
