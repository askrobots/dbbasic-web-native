#!/usr/bin/env node

/**
 * Simple build script for Semantic Components
 * Minifies source files for CDN distribution
 */

const fs = require('fs');
const path = require('path');

const sourceFile = process.argv[2];

if (!sourceFile) {
    console.error('Usage: node build.js <source-file>');
    process.exit(1);
}

const sourcePath = path.join(__dirname, sourceFile);
const fileName = path.basename(sourceFile, '.js');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Read source file
const source = fs.readFileSync(sourcePath, 'utf8');

// Add version header
const version = require('./package.json').version;
const header = `/**
 * Semantic Components v${version}
 * ${fileName}.js
 *
 * Intent-based, context-aware, modality-agnostic web components
 * https://semantic-components.dev
 *
 * Copyright (c) ${new Date().getFullYear()} Semantic Components Team
 * Released under the MIT License
 */

`;

// Copy to dist (full version)
const fullPath = path.join(distDir, `${fileName}.js`);
fs.writeFileSync(fullPath, header + source);
console.log(`✓ Built ${fileName}.js`);

// Create ESM version
const esmSource = source.replace(
    /if \(typeof module !== 'undefined' && module\.exports\) \{[\s\S]*?\}/g,
    ''
);
const esmPath = path.join(distDir, `${fileName}.esm.js`);
fs.writeFileSync(esmPath, header + esmSource + '\nexport default window.semanticContext || {};');
console.log(`✓ Built ${fileName}.esm.js`);

// Simple minification (remove comments and extra whitespace)
const minified = source
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\/\/.*/g, '') // Remove single-line comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*([{}();,:])\s*/g, '$1') // Remove spaces around symbols
    .trim();

const minPath = path.join(distDir, `${fileName}.min.js`);
fs.writeFileSync(minPath, header + minified);
console.log(`✓ Built ${fileName}.min.js`);

// File sizes
const fullSize = fs.statSync(fullPath).size;
const minSize = fs.statSync(minPath).size;
const savings = ((1 - minSize / fullSize) * 100).toFixed(1);

console.log(`\nFile sizes:`);
console.log(`  Full: ${(fullSize / 1024).toFixed(1)} KB`);
console.log(`  Min:  ${(minSize / 1024).toFixed(1)} KB (${savings}% smaller)`);
