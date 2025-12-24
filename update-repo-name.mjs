import { execSync } from 'child_process';
import fs from 'fs';

// Get the Git repository name
const repoName = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim().split('/').pop();

// Read and parse the package.json file
const packageJsonPath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Update the predeploy script to add the Git repository name as the base path
packageJson.scripts.predeploy = `vite build --base=/${repoName}/`;

// Write the updated package.json back to the file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Build the app
execSync(`vite build --base=/${repoName}/`);