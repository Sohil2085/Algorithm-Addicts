const fs = require('fs');
const path = require('path');

const targetFiles = [
    './client/src/pages/LenderOnboardingPage.jsx',
    './client/src/pages/LenderKycPage.jsx',
    './client/src/components/KycForm.jsx',
    './client/src/pages/InvoiceList.jsx',
    './client/src/pages/AdminLenderKycPage.jsx',
    './client/src/pages/AdminKycPage.jsx',
    './client/src/pages/MSMEDashboard.jsx'
];

const replacements = [
    { target: /bg-slate-950/g, replacement: 'bg-theme-bg' },
    { target: /bg-slate-900/g, replacement: 'bg-theme-surface' },
    { target: /bg-slate-800/g, replacement: 'bg-theme-surface-hover' },
    { target: /bg-slate-700/g, replacement: 'bg-theme-surface-active' },
    { target: /border-white\/10/g, replacement: 'border-theme-border' },
    { target: /border-white\/20/g, replacement: 'border-theme-border-hover' },
    { target: /bg-white\/5/g, replacement: 'bg-theme-surface-hover' },
    { target: /bg-white\/10/g, replacement: 'bg-theme-surface-active' },
    { target: /text-white\/40/g, replacement: 'text-theme-text-muted' },
    { target: /text-white\/50/g, replacement: 'text-theme-text-muted' },
    { target: /text-white\/60/g, replacement: 'text-theme-text-muted' },
    { target: /text-white\/80/g, replacement: 'text-theme-text-muted' },
    { target: /text-white/g, replacement: 'text-theme-text' },
    { target: /hover:text-white/g, replacement: 'hover:text-theme-text' },
    { target: /placeholder:text-white\/20/g, replacement: 'placeholder:text-theme-text-muted/50' },
    { target: /hover:bg-white\/5/g, replacement: 'hover:bg-theme-surface-hover' },
    { target: /hover:bg-white\/10/g, replacement: 'hover:bg-theme-surface-hover' },
    { target: /hover:bg-white\/20/g, replacement: 'hover:bg-theme-surface-active' }
];

targetFiles.forEach(relPath => {
    const fullPath = path.resolve('c:/Users/prash/OneDrive/Documents/GitHub/Algorithm-Addicts', relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${fullPath}, does not exist`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Quick test if "text-white" or something exists
    if (!content.includes('bg-slate') && !content.includes('text-white')) {
        console.log(`Skipping ${fullPath}, already processed?`);
        return;
    }

    replacements.forEach(rule => {
        content = content.replace(rule.target, rule.replacement);
    });

    // Fix a few potential double-replacements
    content = content.replace(/text-theme-text\/[0-9]+/g, 'text-theme-text-muted');

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${fullPath}`);
});
console.log('Done mapping themes!');
