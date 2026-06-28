#!/usr/bin/env node
/**
 * PostToolUse Hook — Session Statistics Tracker
 *
 * Tracks skill invocations and tool usage during a session to provide
 * visibility into how the plugin is helping. Logs to a session stats file
 * that can be read by the stop-reminders hook or on user request.
 *
 * Triggered on: Skill tool use (PostToolUse matcher: Skill)
 *
 * Input:  stdin JSON with { tool_name, tool_input, session_id, cwd, ... }
 * Output: stdout JSON (always {}, never blocks)
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE || '.',
  '.claude',
  'hooks-logs'
);

const STATS_FILE = path.join(LOG_DIR, 'session-stats.json');

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
      // Auto-expire after 2 hours (new session)
      if (raw.startedAt && (Date.now() - new Date(raw.startedAt).getTime()) > 2 * 60 * 60 * 1000) {
        return createFreshStats();
      }
      return raw;
    }
  } catch {
    // Corrupted file — start fresh
  }
  return createFreshStats();
}

function createFreshStats() {
  return {
    startedAt: new Date().toISOString(),
    skillInvocations: {},
    totalSkillCalls: 0,
    hookBlocks: 0,
    filesEdited: 0,
    verificationsRun: 0,
  };
}

function saveStats(stats) {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch {
    // Silently ignore
  }
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input } = data;

    if (tool_name !== 'Skill') {
      process.stdout.write('{}');
      return;
    }

    const skillName = tool_input?.skill || 'unknown';
    const stats = loadStats();

    // Track skill invocation
    stats.skillInvocations[skillName] = (stats.skillInvocations[skillName] || 0) + 1;
    stats.totalSkillCalls += 1;

    saveStats(stats);
  } catch {
    // Silently ignore
  }

  process.stdout.write('{}');
}

if (require.main === module) {
  main();
} else {
  module.exports = { loadStats, saveStats, createFreshStats, STATS_FILE };
}
