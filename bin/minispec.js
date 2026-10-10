#!/usr/bin/env node
/**
 * MiniSpeckit CLI
 * A lightweight, zero-dependency Spec-Driven Development toolkit for AI coding agents.
 * 
 * Works natively on Windows, macOS, and Linux without external npm dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// ANSI Color Helpers
// ---------------------------------------------------------------------------
const isColorSupported = !process.env.NO_COLOR && (process.stdout.isTTY || process.env.FORCE_COLOR);
const c = {
  reset: isColorSupported ? '\x1b[0m' : '',
  bold: isColorSupported ? '\x1b[1m' : '',
  dim: isColorSupported ? '\x1b[2m' : '',
  cyan: isColorSupported ? '\x1b[36m' : '',
  green: isColorSupported ? '\x1b[32m' : '',
  yellow: isColorSupported ? '\x1b[33m' : '',
  red: isColorSupported ? '\x1b[31m' : '',
  magenta: isColorSupported ? '\x1b[35m' : '',
  gray: isColorSupported ? '\x1b[90m' : '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function getNextSpecNumber(specsDir) {
  if (!fs.existsSync(specsDir)) return '001';
  const files = fs.readdirSync(specsDir);
  let maxNum = 0;
  for (const f of files) {
    const m = f.match(/^(\d{3,4})[-_]/);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return String(maxNum + 1).padStart(3, '0');
}

function findSpecs(specsDir) {
  if (!fs.existsSync(specsDir)) return [];
  const entries = fs.readdirSync(specsDir, { withFileTypes: true });
  const specs = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
      specs.push({
        name: entry.name,
        fullPath: path.join(specsDir, entry.name),
      });
    }
  }

  // Sort by filename
  return specs.sort((a, b) => a.name.localeCompare(b.name));
}

function parseSpecFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);

  // Extract ID from filename or title
  const idMatch = filename.match(/^(\d+)/);
  const id = idMatch ? idMatch[1] : '---';

  // Extract Title from first markdown heading
  const titleMatch = content.match(/^#\s+(?:Spec\s+\d+:\s*|API\s+Spec\s+\d+:\s*|Bugfix\s+Spec\s+\d+:\s*)?([^\n\r]+)/m);
  const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.md$/, '');

  // Extract Status
  const statusMatch = content.match(/\*\*Status\*\*:\s*([A-Za-z\s]+)/i);
  let status = statusMatch ? statusMatch[1].trim() : 'Draft';

  // Count Tasks (- [ ] vs - [x])
  const totalTasks = (content.match(/^\s*-\s*\[[ xX]\]/gm) || []).length;
  const completedTasks = (content.match(/^\s*-\s*\[[xX]\]/gm) || []).length;

  if (totalTasks > 0 && completedTasks === totalTasks && status.toLowerCase() === 'draft') {
    status = 'Completed';
  } else if (completedTasks > 0 && status.toLowerCase() === 'draft') {
    status = 'In Progress';
  }

  return {
    id,
    filename,
    title,
    status,
    totalTasks,
    completedTasks,
    percent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    content,
  };
}

function renderProgressBar(percent, width = 10) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  if (percent === 100) return `${c.green}[${bar}]${c.reset}`;
  if (percent > 0) return `${c.cyan}[${bar}]${c.reset}`;
  return `${c.gray}[${bar}]${c.reset}`;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdHelp() {
  console.log(`
${c.bold}${c.cyan}MiniSpeckit${c.reset} ${c.gray}v${getPackageVersion()}${c.reset}
${c.dim}A lightweight, zero-dependency Spec-Driven Development toolkit for AI coding agents.${c.reset}

${c.bold}USAGE:${c.reset}
  ${c.green}minispec${c.reset} <command> [options]
  ${c.green}npx minispeckit${c.reset} <command> [options]

${c.bold}COMMANDS:${c.reset}
  ${c.cyan}init${c.reset}                      Initialize MiniSpeckit in the current project
  ${c.cyan}new <title>${c.reset}               Create a new feature specification
  ${c.cyan}status${c.reset}                    Display status & progress bar across all specs
  ${c.cyan}check${c.reset}                     Lint specs for missing sections and task health
  ${c.cyan}list${c.reset}                      List all specs in this project
  ${c.cyan}help${c.reset}, ${c.cyan}--help${c.reset}            Show this help message
  ${c.cyan}version${c.reset}, ${c.cyan}-v${c.reset}             Show version number

${c.bold}OPTIONS FOR 'new':${c.reset}
  ${c.yellow}-t, --template <name>${c.reset}     Template to use: ${c.dim}default | api | bugfix${c.reset} (default: "default")

${c.bold}EXAMPLES:${c.reset}
  ${c.gray}# Initialize in your repository${c.reset}
  $ minispec init

  # Create a new feature spec
  $ minispec new "User Profile Settings"

  # Create a backend API spec
  $ minispec new "Payment Webhook" --template api

  # Create a bugfix spec
  $ minispec new "Fix Memory Leak in Cache" --template bugfix

  # Check progress of all features
  $ minispec status
`);
}

function cmdInit(args) {
  const cwd = process.cwd();
  const specsDir = path.join(cwd, 'specs');
  const dotMinispec = path.join(cwd, '.minispec', 'templates');

  console.log(`\n${c.bold}${c.cyan}== Initializing MiniSpeckit ==${c.reset}\n`);

  // 1. Create specs/ directory
  if (!fs.existsSync(specsDir)) {
    fs.mkdirSync(specsDir, { recursive: true });
    fs.writeFileSync(path.join(specsDir, '.gitkeep'), '');
    console.log(`  ${c.green}✓${c.reset} Created ${c.bold}specs/${c.reset}`);
  } else {
    console.log(`  ${c.gray}• specs/ already exists${c.reset}`);
  }

  // 2. Copy templates to .minispec/templates for customization
  fs.mkdirSync(dotMinispec, { recursive: true });
  const pkgTemplates = path.join(PKG_ROOT, 'templates');
  if (fs.existsSync(pkgTemplates)) {
    const files = fs.readdirSync(pkgTemplates);
    for (const f of files) {
      const dest = path.join(dotMinispec, f);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(pkgTemplates, f), dest);
        console.log(`  ${c.green}✓${c.reset} Installed template ${c.cyan}.minispec/templates/${f}${c.reset}`);
      }
    }
  }

  // 3. Setup Universal Agent instructions
  const agentsFile = path.join(cwd, 'AGENTS.md');
  if (!fs.existsSync(agentsFile)) {
    const defaultAgents = `# Project Agent Instructions\n\nThis project uses **MiniSpeckit** for Spec-Driven Development.\nSpecs live in \`specs/\`. Read the feature spec before implementing code.\n`;
    fs.writeFileSync(agentsFile, defaultAgents, 'utf8');
    console.log(`  ${c.green}✓${c.reset} Created ${c.bold}AGENTS.md${c.reset}`);
  } else {
    console.log(`  ${c.gray}• AGENTS.md exists${c.reset}`);
  }

  // 4. Cursor rules if .cursor directory exists or requested
  const cursorDir = path.join(cwd, '.cursor', 'rules');
  if (fs.existsSync(path.join(cwd, '.cursor'))) {
    fs.mkdirSync(cursorDir, { recursive: true });
    const cursorFile = path.join(cursorDir, 'minispec.mdc');
    if (!fs.existsSync(cursorFile)) {
      const src = path.join(PKG_ROOT, 'integrations', 'cursor', 'minispec.mdc');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, cursorFile);
        console.log(`  ${c.green}✓${c.reset} Added Cursor rule ${c.cyan}.cursor/rules/minispec.mdc${c.reset}`);
      }
    }
  }

  console.log(`\n${c.bold}${c.green}MiniSpeckit initialized successfully!${c.reset}`);
  console.log(`\nNext step:`);
  console.log(`  ${c.cyan}minispec new "your-first-feature"${c.reset}\n`);
}

function cmdNew(args) {
  let templateName = 'default';
  const nonFlagArgs = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-t' || args[i] === '--template') {
      templateName = args[i + 1] || 'default';
      i++;
    } else if (!args[i].startsWith('-')) {
      nonFlagArgs.push(args[i]);
    }
  }
  const title = nonFlagArgs.join(' ').trim();

  if (!title) {
    console.error(`\n${c.red}Error:${c.reset} Missing feature title.\n`);
    console.log(`Usage: ${c.green}minispec new "feature-title" [--template <default|api|bugfix>]${c.reset}\n`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const specsDir = path.join(cwd, 'specs');
  if (!fs.existsSync(specsDir)) {
    fs.mkdirSync(specsDir, { recursive: true });
  }

  const slug = slugify(title);
  const nextNum = getNextSpecNumber(specsDir);
  const filename = `${nextNum}-${slug}.md`;
  const destPath = path.join(specsDir, filename);

  // Locate template
  let templateContent = null;
  const templateFileName = templateName === 'api' ? 'api-spec.md' : templateName === 'bugfix' ? 'bugfix-spec.md' : 'spec.md';

  // 1. Try project-level .minispec/templates
  const localTemplatePath = path.join(cwd, '.minispec', 'templates', templateFileName);
  // 2. Try package templates
  const pkgTemplatePath = path.join(PKG_ROOT, 'templates', templateFileName);

  if (fs.existsSync(localTemplatePath)) {
    templateContent = fs.readFileSync(localTemplatePath, 'utf8');
  } else if (fs.existsSync(pkgTemplatePath)) {
    templateContent = fs.readFileSync(pkgTemplatePath, 'utf8');
  } else {
    // Fallback minimal template
    templateContent = `# Spec {{ID}}: {{TITLE}}\n\n**Status**: Draft\n**Created**: {{DATE}}\n\n## 1. Specification\n- Context & Story\n\n## 2. Technical Plan\n- Architecture\n\n## 3. Tasks\n- [ ] Task 1\n`;
  }

  const today = new Date().toISOString().split('T')[0];
  const rendered = templateContent
    .replace(/\{\{ID\}\}/g, nextNum)
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{DATE\}\}/g, today);

  fs.writeFileSync(destPath, rendered, 'utf8');

  console.log(`\n${c.green}${c.bold}✓ Created new spec:${c.reset} ${c.bold}${path.relative(cwd, destPath)}${c.reset}`);
  console.log(`${c.gray}Template used: ${templateFileName}${c.reset}\n`);
  console.log(`${c.bold}Agent prompt tip:${c.reset}`);
  console.log(`  ${c.cyan}"Please read specs/${filename} and help me refine the requirements."${c.reset}\n`);
}

function cmdStatus(args) {
  const cwd = process.cwd();
  const specsDir = path.join(cwd, 'specs');
  const specFiles = findSpecs(specsDir);

  if (specFiles.length === 0) {
    console.log(`\n${c.yellow}No specifications found in specs/${c.reset}`);
    console.log(`Run ${c.cyan}minispec new "feature-title"${c.reset} to create your first spec.\n`);
    return;
  }

  console.log(`\n${c.bold}${c.cyan}MiniSpeckit Feature Status${c.reset}`);
  console.log(`${c.gray}Found ${specFiles.length} specification(s) in specs/${c.reset}\n`);

  console.log(`${c.bold}ID    SPEC FILE                         TASKS    PROGRESS       STATUS${c.reset}`);
  console.log(`${c.gray}--------------------------------------------------------------------------------${c.reset}`);

  let completedCount = 0;
  let inProgressCount = 0;
  let draftCount = 0;

  for (const s of specFiles) {
    const data = parseSpecFile(s.fullPath);
    const idCol = data.id.padEnd(5);
    const fileCol = (data.filename.length > 32 ? data.filename.slice(0, 29) + '...' : data.filename).padEnd(33);
    const taskCol = `${data.completedTasks}/${data.totalTasks}`.padEnd(8);
    const progressCol = `${renderProgressBar(data.percent, 8)} ${String(data.percent).padStart(3)}%`.padEnd(20);

    let statusCol = data.status;
    if (data.status.toLowerCase() === 'completed') {
      statusCol = `${c.green}${data.status}${c.reset}`;
      completedCount++;
    } else if (data.status.toLowerCase() === 'in progress') {
      statusCol = `${c.cyan}${data.status}${c.reset}`;
      inProgressCount++;
    } else {
      statusCol = `${c.yellow}${data.status}${c.reset}`;
      draftCount++;
    }

    console.log(`${idCol} ${fileCol} ${taskCol} ${progressCol} ${statusCol}`);
  }

  console.log(`${c.gray}--------------------------------------------------------------------------------${c.reset}`);
  console.log(`Summary: ${c.green}${completedCount} completed${c.reset} | ${c.cyan}${inProgressCount} in progress${c.reset} | ${c.yellow}${draftCount} draft(s)${c.reset}\n`);
}

function cmdCheck(args) {
  const cwd = process.cwd();
  const specsDir = path.join(cwd, 'specs');
  const specFiles = findSpecs(specsDir);

  console.log(`\n${c.bold}${c.cyan}== MiniSpeckit Spec Health Check ==${c.reset}\n`);

  if (specFiles.length === 0) {
    console.log(`  ${c.yellow}! No specs found in specs/${c.reset}\n`);
    return;
  }

  let issuesFound = 0;

  for (const s of specFiles) {
    const data = parseSpecFile(s.fullPath);
    const issues = [];

    if (data.totalTasks === 0) {
      issues.push('No checkable tasks defined (- [ ])');
    }
    if (!data.content.includes('Acceptance Criteria')) {
      issues.push('Missing "Acceptance Criteria" section');
    }
    if (!data.content.includes('Technical Plan') && !data.content.includes('Architecture')) {
      issues.push('Missing "Technical Plan" or "Architecture" section');
    }
    if (data.status.toLowerCase() === 'completed' && data.completedTasks < data.totalTasks) {
      issues.push(`Marked "Completed" but ${data.totalTasks - data.completedTasks} tasks remain unchecked`);
    }

    if (issues.length === 0) {
      console.log(`  ${c.green}✓${c.reset} ${c.bold}${s.name}${c.reset} ${c.dim}(Healthy: ${data.completedTasks}/${data.totalTasks} tasks)${c.reset}`);
    } else {
      issuesFound += issues.length;
      console.log(`  ${c.yellow}▲${c.reset} ${c.bold}${s.name}${c.reset}`);
      for (const iss of issues) {
        console.log(`    ${c.red}•${c.reset} ${iss}`);
      }
    }
  }

  console.log('');
  if (issuesFound === 0) {
    console.log(`  ${c.green}${c.bold}All specifications passed health checks!${c.reset}\n`);
  } else {
    console.log(`  ${c.yellow}${c.bold}${issuesFound} issue(s) flagged across specs.${c.reset}\n`);
  }
}

function cmdList(args) {
  const cwd = process.cwd();
  const specsDir = path.join(cwd, 'specs');
  const specFiles = findSpecs(specsDir);

  if (specFiles.length === 0) {
    console.log(`No specs found.`);
    return;
  }

  console.log(`\nSpecifications (${specFiles.length}):`);
  for (const s of specFiles) {
    const data = parseSpecFile(s.fullPath);
    console.log(`  • [${data.id}] ${data.title} (${data.filename})`);
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// Main Router
// ---------------------------------------------------------------------------
const [,, command, ...args] = process.argv;

switch (command) {
  case 'init':
    cmdInit(args);
    break;
  case 'new':
  case 'create':
    cmdNew(args);
    break;
  case 'status':
    cmdStatus(args);
    break;
  case 'check':
  case 'lint':
    cmdCheck(args);
    break;
  case 'list':
  case 'ls':
    cmdList(args);
    break;
  case '-v':
  case '--version':
  case 'version':
    console.log(`minispeckit v${getPackageVersion()}`);
    break;
  case '-h':
  case '--help':
  case 'help':
  case undefined:
    cmdHelp();
    break;
  default:
    console.error(`\n${c.red}Unknown command:${c.reset} ${command}\n`);
    cmdHelp();
    process.exit(1);
}
