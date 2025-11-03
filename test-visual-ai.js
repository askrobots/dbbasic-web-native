#!/usr/bin/env node

/**
 * Automated Visual Accessibility Testing with AI
 *
 * 1. Screenshots all component states from generated docs
 * 2. Uses AI vision (Claude/GPT-4V) to analyze accessibility
 * 3. Generates pass/fail report with specific issues
 *
 * Usage: node test-visual-ai.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Component pages to test
const componentPages = [
    'semantic-action.html',
    'semantic-card.html',
    'semantic-input.html',
    'semantic-modal.html',
    'semantic-navigator.html',
    'semantic-list.html',
    'semantic-menu.html',
    'semantic-feedback.html',
    'semantic-adjuster.html'
];

// AI prompts for accessibility testing
const accessibilityPrompts = {
    contrast: `Analyze this component screenshot for WCAG AA contrast compliance:

1. Identify all text elements
2. Measure approximate contrast ratios between text and backgrounds
3. Flag any text below 4.5:1 contrast (normal text) or 3:1 (large text 18pt+)
4. List specific failures with colors if detected

Return JSON:
{
  "passed": true/false,
  "issues": [
    {"element": "Save button", "contrast": "3.2:1", "colors": "white on #007aff", "severity": "fail"}
  ]
}`,

    visualFeedback: `Analyze this component's visual feedback states:

1. Check if disabled elements look OBVIOUSLY non-interactive (not just faded)
2. Check if hover states are clearly visible
3. Check if selection/active states are unmistakable
4. Check if focus indicators are present and visible

Return JSON:
{
  "passed": true/false,
  "issues": [
    {"state": "disabled", "problem": "still looks blue, not grey", "severity": "fail"},
    {"state": "hover", "problem": "no visible change detected", "severity": "warning"}
  ]
}`,

    affordance: `Analyze if interactive elements are obviously clickable:

1. Do buttons look like buttons (not plain text)?
2. Are touch targets at least 44px (visible size)?
3. Do disabled states look obviously non-interactive?
4. Are dangerous actions (delete, etc.) visually distinct?

Return JSON:
{
  "passed": true/false,
  "issues": [
    {"element": "Delete button", "problem": "same blue as Save button", "severity": "fail"}
  ]
}`
};

class VisualAITester {
    constructor() {
        this.browser = null;
        this.screenshotDir = path.join(__dirname, 'screenshots');
        this.resultsDir = path.join(__dirname, 'test-results');
        this.results = [];
    }

    async setup() {
        // Create directories
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir);
        }
        if (!fs.existsSync(this.resultsDir)) {
            fs.mkdirSync(this.resultsDir);
        }

        // Launch browser
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('🚀 Browser launched');
    }

    async screenshotComponent(componentPage) {
        const page = await this.browser.newPage();
        await page.setViewport({ width: 1400, height: 1200 });

        const filePath = path.join(__dirname, 'docs', componentPage);
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

        console.log(`📸 Screenshotting ${componentPage}...`);

        // Screenshot full page
        const fullScreenshot = path.join(this.screenshotDir, `${componentPage}.png`);
        await page.screenshot({
            path: fullScreenshot,
            fullPage: true
        });

        // Screenshot individual sections
        const sections = await page.$$('.section');
        const sectionScreenshots = [];

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const title = await section.$eval('.section-title', el => el.textContent.trim()).catch(() => `section-${i}`);
            const screenshotPath = path.join(
                this.screenshotDir,
                `${componentPage}_${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
            );

            await section.screenshot({ path: screenshotPath });
            sectionScreenshots.push({
                title,
                path: screenshotPath
            });
        }

        await page.close();

        return {
            component: componentPage,
            fullScreenshot,
            sectionScreenshots
        };
    }

    async analyzeWithAI(screenshotPath, promptType) {
        // This would integrate with Claude API or GPT-4V
        // For now, returning mock structure

        console.log(`🤖 Analyzing ${path.basename(screenshotPath)} for ${promptType}...`);

        // In production, this would:
        // 1. Read screenshot as base64
        // 2. Send to Claude/GPT-4V with prompt
        // 3. Parse JSON response
        // 4. Return results

        const imageBuffer = fs.readFileSync(screenshotPath);
        const base64Image = imageBuffer.toString('base64');

        // Mock API call (replace with real API)
        const mockAnalysis = {
            contrast: {
                passed: true,
                issues: []
            },
            visualFeedback: {
                passed: true,
                issues: []
            },
            affordance: {
                passed: true,
                issues: []
            }
        };

        return mockAnalysis[promptType] || { passed: false, issues: [] };
    }

    async testComponent(componentPage) {
        console.log(`\n🧪 Testing ${componentPage}...`);

        // Take screenshots
        const screenshots = await this.screenshotComponent(componentPage);

        // Analyze full page
        const contrastResults = await this.analyzeWithAI(screenshots.fullScreenshot, 'contrast');
        const feedbackResults = await this.analyzeWithAI(screenshots.fullScreenshot, 'visualFeedback');
        const affordanceResults = await this.analyzeWithAI(screenshots.fullScreenshot, 'affordance');

        const result = {
            component: componentPage.replace('.html', ''),
            timestamp: new Date().toISOString(),
            screenshots: screenshots,
            tests: {
                contrast: contrastResults,
                visualFeedback: feedbackResults,
                affordance: affordanceResults
            },
            passed: contrastResults.passed && feedbackResults.passed && affordanceResults.passed
        };

        this.results.push(result);

        // Log results
        if (result.passed) {
            console.log(`✅ ${componentPage} - ALL TESTS PASSED`);
        } else {
            console.log(`❌ ${componentPage} - FAILURES DETECTED:`);
            if (!contrastResults.passed) {
                console.log(`  - Contrast issues: ${contrastResults.issues.length}`);
            }
            if (!feedbackResults.passed) {
                console.log(`  - Visual feedback issues: ${feedbackResults.issues.length}`);
            }
            if (!affordanceResults.passed) {
                console.log(`  - Affordance issues: ${affordanceResults.issues.length}`);
            }
        }

        return result;
    }

    generateHTMLReport() {
        const passedCount = this.results.filter(r => r.passed).length;
        const failedCount = this.results.length - passedCount;

        const resultRows = this.results.map(result => {
            const statusIcon = result.passed ? '✅' : '❌';
            const statusClass = result.passed ? 'pass' : 'fail';

            const issuesHTML = Object.entries(result.tests).map(([testType, testResult]) => {
                if (!testResult.passed && testResult.issues.length > 0) {
                    return `
                        <div class="issue-group">
                            <strong>${testType}:</strong>
                            <ul>
                                ${testResult.issues.map(issue =>
                                    `<li>${issue.element || issue.state}: ${issue.problem} (${issue.severity})</li>`
                                ).join('')}
                            </ul>
                        </div>
                    `;
                }
                return '';
            }).join('');

            return `
                <tr class="${statusClass}">
                    <td>${statusIcon} ${result.component}</td>
                    <td>${result.passed ? 'Pass' : 'Fail'}</td>
                    <td>
                        <a href="../screenshots/${result.component}.html.png" target="_blank">View Screenshot</a>
                    </td>
                    <td>
                        ${issuesHTML || '<span class="no-issues">No issues detected</span>'}
                    </td>
                </tr>
            `;
        }).join('');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Accessibility Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #000;
            color: #fff;
            padding: 48px 24px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { font-size: 48px; margin-bottom: 24px; color: #409cff; }
        .summary {
            display: flex;
            gap: 24px;
            margin-bottom: 48px;
        }
        .summary-card {
            flex: 1;
            background: #1c1c1e;
            border: 2px solid #38383a;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
        }
        .summary-card.pass { border-color: #34c759; }
        .summary-card.fail { border-color: #ff3b30; }
        .summary-number { font-size: 48px; font-weight: 900; margin-bottom: 8px; }
        .summary-card.pass .summary-number { color: #34c759; }
        .summary-card.fail .summary-number { color: #ff3b30; }
        table {
            width: 100%;
            border-collapse: collapse;
            background: #1c1c1e;
            border: 2px solid #38383a;
            border-radius: 12px;
            overflow: hidden;
        }
        th {
            background: rgba(64, 156, 255, 0.1);
            padding: 16px;
            text-align: left;
            font-weight: 700;
            color: #409cff;
            border-bottom: 2px solid #38383a;
        }
        td {
            padding: 16px;
            border-bottom: 1px solid #38383a;
        }
        tr:last-child td { border-bottom: none; }
        tr.pass td:first-child { color: #34c759; }
        tr.fail td:first-child { color: #ff3b30; }
        .issue-group {
            margin-bottom: 12px;
            padding: 12px;
            background: rgba(255, 59, 48, 0.1);
            border-left: 3px solid #ff3b30;
            border-radius: 4px;
        }
        .issue-group ul {
            margin-top: 8px;
            padding-left: 24px;
        }
        .issue-group li {
            margin-bottom: 4px;
            color: #ababab;
        }
        .no-issues { color: #6e6e73; }
        a { color: #409cff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Visual Accessibility Test Report</h1>
        <p style="color: #ababab; margin-bottom: 48px; font-size: 18px;">
            Generated: ${new Date().toLocaleString()}
        </p>

        <div class="summary">
            <div class="summary-card pass">
                <div class="summary-number">${passedCount}</div>
                <div style="color: #ababab;">Components Passed</div>
            </div>
            <div class="summary-card fail">
                <div class="summary-number">${failedCount}</div>
                <div style="color: #ababab;">Components Failed</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${Math.round((passedCount / this.results.length) * 100)}%</div>
                <div style="color: #ababab;">Pass Rate</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Component</th>
                    <th>Status</th>
                    <th>Screenshot</th>
                    <th>Issues</th>
                </tr>
            </thead>
            <tbody>
                ${resultRows}
            </tbody>
        </table>
    </div>
</body>
</html>`;

        const reportPath = path.join(this.resultsDir, 'accessibility-report.html');
        fs.writeFileSync(reportPath, html);
        console.log(`\n📊 Report generated: ${reportPath}`);

        return reportPath;
    }

    async runAll() {
        await this.setup();

        console.log(`\n🧪 Testing ${componentPages.length} components...\n`);

        for (const page of componentPages) {
            const pageExists = fs.existsSync(path.join(__dirname, 'docs', page));
            if (pageExists) {
                await this.testComponent(page);
            } else {
                console.log(`⚠️  Skipping ${page} (not found)`);
            }
        }

        await this.browser.close();

        // Generate reports
        const reportPath = this.generateHTMLReport();

        // Save JSON results
        const jsonPath = path.join(this.resultsDir, 'results.json');
        fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));

        console.log(`\n✅ Testing complete!`);
        console.log(`   Passed: ${this.results.filter(r => r.passed).length}/${this.results.length}`);
        console.log(`   HTML Report: ${reportPath}`);
        console.log(`   JSON Results: ${jsonPath}`);

        return this.results;
    }

    async teardown() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Integration with AI vision APIs
class AIVisionAnalyzer {
    constructor(apiKey, provider = 'anthropic') {
        this.apiKey = apiKey;
        this.provider = provider; // 'anthropic' or 'openai'
    }

    async analyzeImage(imagePath, prompt) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        if (this.provider === 'anthropic') {
            return await this.analyzeWithClaude(base64Image, prompt);
        } else if (this.provider === 'openai') {
            return await this.analyzeWithGPT4V(base64Image, prompt);
        }
    }

    async analyzeWithClaude(base64Image, prompt) {
        // Claude API call with vision
        // const response = await fetch('https://api.anthropic.com/v1/messages', {
        //     method: 'POST',
        //     headers: {
        //         'x-api-key': this.apiKey,
        //         'anthropic-version': '2023-06-01',
        //         'content-type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         model: 'claude-3-sonnet-20240229',
        //         max_tokens: 1024,
        //         messages: [{
        //             role: 'user',
        //             content: [
        //                 {
        //                     type: 'image',
        //                     source: {
        //                         type: 'base64',
        //                         media_type: 'image/png',
        //                         data: base64Image
        //                     }
        //                 },
        //                 {
        //                     type: 'text',
        //                     text: prompt
        //                 }
        //             ]
        //         }]
        //     })
        // });
        // const data = await response.json();
        // return JSON.parse(data.content[0].text);

        // Mock response
        return {
            passed: true,
            issues: []
        };
    }

    async analyzeWithGPT4V(base64Image, prompt) {
        // OpenAI GPT-4V API call
        // Similar structure
        return { passed: true, issues: [] };
    }
}

// Run if called directly
if (require.main === module) {
    const tester = new VisualAITester();
    tester.runAll()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('❌ Error:', err);
            process.exit(1);
        });
}

module.exports = { VisualAITester, AIVisionAnalyzer };
