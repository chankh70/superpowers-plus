#!/usr/bin/env node
/**
 * UserPromptSubmit Hook — Proactive Skill Activation + Memory Recall
 *
 * Analyzes the user's prompt before Claude processes it and injects
 * two types of context:
 *
 * 1. Skill hints — which superpowers-plus skills are relevant to
 *    this prompt (reinforces using-superpowers routing deterministically).
 *
 * 2. Memory recall — relevant past decisions from session-log.md that
 *    match keywords extracted from the prompt. Surfaces historical context
 *    automatically at the moment it's needed.
 *
 * Features:
 * - Micro-task detection: short, specific prompts skip both features entirely
 * - Confidence threshold: only suggests skills when match confidence is meaningful
 * - Memory recall: keyword-based grep of session-log.md, ≤2 entries, deduped
 * - Smart routing: fewer false positives, zero overhead for simple tasks
 *
 * Input:  stdin JSON with { prompt, session_id, cwd, ... }
 * Output: stdout JSON with additionalContext suggesting relevant skills
 *         and/or surfacing relevant past decisions
 */

const fs = require('fs');
const path = require('path');

const HOOKS_DIR = __dirname;

let RULES = [];
try {
  const rulesPath = path.join(HOOKS_DIR, 'skill-rules.json');
  RULES = JSON.parse(fs.readFileSync(rulesPath, 'utf8')).rules || [];
} catch (e) {
  process.stdout.write('{}');
  process.exit(0);
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const CONFIDENCE_THRESHOLD = 2;
const MAX_MEMORY_ENTRIES = 2;
const MIN_KEYWORD_LENGTH = 4;
const MAX_ENTRY_CHARS = 1500;

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'this', 'that',
  'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'what', 'which', 'who', 'when', 'where', 'why', 'how',
  'all', 'both', 'each', 'every', 'any', 'some', 'not', 'only',
  'than', 'too', 'very', 'just', 'now', 'also', 'but', 'and', 'or',
  'if', 'then', 'so', 'let', 'get', 'got', 'go', 'make', 'know',
  'think', 'see', 'look', 'use', 'using', 'used', 'like', 'want',
  'need', 'please', 'here', 'there', 'about', 'more', 'other', 'new',
  'good', 'right', 'well', 'really', 'actually', 'already', 'still',
  'even', 'back', 'thing', 'things', 'way', 'work', 'works', 'worked',
]);

function isMicroTask(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).length;

  if (wordCount <= 8) {
    const microPatterns = [
      /^(fix|change|rename|update|replace|set|remove|delete|add)\s+(the\s+)?(typo|name|variable|import|spacing|indent)/i,
      /^rename\s+\S+\s+to\s+\S+$/i,
      /^(change|update|set)\s+.+\s+(to|=)\s+.+$/i,
      /^remove\s+(the\s+)?(unused|extra|duplicate)\s+/i,
      /^add\s+(a\s+)?(missing\s+)?(import|comma|semicolon|bracket|paren)/i,
      /^fix\s+(the\s+)?(typo|spelling|whitespace|indent(ation)?)/i,
    ];
    if (microPatterns.some(p => p.test(lower))) return true;
  }

  if (wordCount <= 12 && /line\s+\d+/i.test(lower) && /(fix|change|update|rename|remove)/i.test(lower)) {
    return true;
  }

  return false;
}

function matchSkills(prompt) {
  if (!prompt || typeof prompt !== 'string') return [];
  const lower = prompt.toLowerCase();
  const matches = [];

  for (const rule of RULES) {
    let score = 0;

    for (const kw of rule.keywords || []) {
      const kwLower = kw.toLowerCase();
      if (kwLower.includes(' ')) {
        if (lower.includes(kwLower)) score += 1;
      } else {
        const re = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
        if (re.test(lower)) score += 1;
      }
    }

    for (const pattern of rule.intentPatterns || []) {
      try {
        const re = new RegExp(pattern, 'i');
        if (re.test(prompt)) score += 2;
      } catch {
        // Skip invalid regex
      }
    }

    if (score >= CONFIDENCE_THRESHOLD) {
      matches.push({
        skill: rule.skill,
        priority: rule.priority,
        type: rule.type,
        score,
      });
    }
  }

  // Deduplicate: keep only the highest-scoring entry per skill name
  const deduped = new Map();
  for (const m of matches) {
    const existing = deduped.get(m.skill);
    if (!existing || m.score > existing.score) {
      deduped.set(m.skill, m);
    }
  }
  const unique = [...deduped.values()];

  unique.sort((a, b) => {
    const pDiff = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
    if (pDiff !== 0) return pDiff;
    return b.score - a.score;
  });

  return unique.slice(0, 3);
}

function buildContext(matches) {
  if (matches.length === 0) return null;

  const skillList = matches
    .map(m => `  - superpowers-plus:${m.skill} (${m.priority})`)
    .join('\n');

  return [
    '<user-prompt-submit-hook>',
    'Skill activation hint: The following skills are relevant to this prompt.',
    'Remember: invoke superpowers-plus:using-superpowers FIRST as the mandatory entry point,',
    'then follow its routing to these suggested skills:',
    skillList,
    'IMPORTANT: If the user names a skill directly (e.g. "use brainstorming"), invoke it via the Skill tool.',
    'Do NOT re-implement the skill\'s purpose with ad-hoc agents or manual steps.',
    '</user-prompt-submit-hook>',
  ].join('\n');
}

function extractKeywords(prompt) {
  if (!prompt || typeof prompt !== 'string') return [];
  const tokens = prompt
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= MIN_KEYWORD_LENGTH && !STOP_WORDS.has(t));
  return [...new Set(tokens)];
}

function searchSessionLog(cwd, keywords) {
  if (!keywords || keywords.length === 0) return [];
  const logPath = path.join(cwd, 'session-log.md');
  let content;
  try {
    content = fs.readFileSync(logPath, 'utf8');
  } catch {
    return [];
  }

  const entries = [];
  let current = null;
  for (const line of content.split('\n')) {
    if (/^## .+\[saved\]/.test(line)) {
      if (current !== null) entries.push(current.trim());
      if (/\[superseded/.test(line)) {
        current = null;
      } else {
        current = line;
      }
    } else if (current !== null) {
      current += '\n' + line;
    }
  }
  if (current !== null) entries.push(current.trim());
  if (entries.length === 0) return [];

  const scored = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const entryLower = entry.toLowerCase();
    const hits = keywords.filter(kw => entryLower.includes(kw)).length;
    if (hits === 0) continue;
    const densityScore = hits / keywords.length;
    const recencyScore = (i + 1) / entries.length;
    const score = (densityScore * 0.7) + (recencyScore * 0.3);
    scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, MAX_MEMORY_ENTRIES).map(s => {
    return s.entry.length > MAX_ENTRY_CHARS
      ? s.entry.slice(0, MAX_ENTRY_CHARS).trimEnd() + '\n*(entry truncated)*'
      : s.entry;
  });
}

function buildMemoryContext(entries) {
  if (!entries || entries.length === 0) return null;

  return [
    '<session-memory-recall>',
    'Relevant past decisions matching this prompt (from session-log.md):',
    '',
    entries.join('\n\n'),
    '',
    '*(Full history searchable in session-log.md)*',
    '</session-memory-recall>',
  ].join('\n');
}

function searchKnownIssues(cwd, keywords) {
  if (!keywords || keywords.length === 0) return [];
  const filePath = path.join(cwd, 'known-issues.md');
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  const entries = [];
  let current = null;
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      if (current !== null) entries.push(current.trim());
      current = line.startsWith('## ~~') ? null : line;
    } else if (current !== null) {
      current += '\n' + line;
    }
  }
  if (current !== null) entries.push(current.trim());
  if (entries.length === 0) return [];

  const scored = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const entryLower = entry.toLowerCase();
    const hits = keywords.filter(kw => entryLower.includes(kw)).length;
    if (hits === 0) continue;
    const densityScore = hits / keywords.length;
    const recencyScore = (i + 1) / entries.length;
    const score = (densityScore * 0.7) + (recencyScore * 0.3);
    scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, MAX_MEMORY_ENTRIES).map(s => {
    return s.entry.length > MAX_ENTRY_CHARS
      ? s.entry.slice(0, MAX_ENTRY_CHARS).trimEnd() + '\n*(entry truncated)*'
      : s.entry;
  });
}

function buildKnownIssuesContext(entries) {
  if (!entries || entries.length === 0) return null;

  return [
    '<known-issues-recall>',
    'Relevant known issues matching this prompt (from known-issues.md):',
    '',
    entries.join('\n\n'),
    '',
    '*(Full list in known-issues.md)*',
    '</known-issues-recall>',
  ].join('\n');
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  try {
    const data = JSON.parse(input);
    const prompt = data.prompt || '';
    const cwd = data.cwd || process.cwd();
    const sessionId = data.session_id || null;

    if (isMicroTask(prompt)) {
      process.stdout.write('{}');
      return;
    }

    const matches = matchSkills(prompt);
    const keywords = extractKeywords(prompt);
    const memoryEntries = searchSessionLog(cwd, keywords);
    const knownIssueEntries = searchKnownIssues(cwd, keywords);

    const skillContext = buildContext(matches);
    const memoryContext = buildMemoryContext(memoryEntries);
    const knownIssuesContext = buildKnownIssuesContext(knownIssueEntries);

    if (!skillContext && !memoryContext && !knownIssuesContext) {
      process.stdout.write('{}');
      return;
    }

    const combined = [skillContext, knownIssuesContext, memoryContext].filter(Boolean).join('\n\n');

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: combined,
      },
    }));
  } catch {
    process.stdout.write('{}');
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = {
    matchSkills,
    buildContext,
    isMicroTask,
    extractKeywords,
    searchSessionLog,
    buildMemoryContext,
    searchKnownIssues,
    buildKnownIssuesContext,
    RULES,
    CONFIDENCE_THRESHOLD,
    STOP_WORDS,
    MAX_MEMORY_ENTRIES,
  };
}
