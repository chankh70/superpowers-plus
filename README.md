# Superpowers (Fork)

> **Fork** of [obra/superpowers](https://github.com/obra/superpowers) — the original project by [Jesse Vincent](https://blog.fsck.com) and the team at [Prime Radiant](https://primeradiant.com). This fork maintains the core skills library with a leaner bootstrap and harness-specific paring.

Superpowers is a complete software development methodology for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them.

## What's Different in This Fork

This fork trims what's no longer needed and adds improvements to core skills:

- **Parallel Brainstorming** — new fan-out/fan-in technique spawning Visionary + Pragmatist subagents for wider solution exploration
- **Brainstorming improvements** — batches clarifying questions in one turn (was one-at-a-time), adds comparison rigor with 4 evaluation dimensions, self-test before presenting
- **Server hardening** — `MAX_BUFFERED_BYTES` guard against unbounded memory in the WebSocket server, PID validation in restart logic
- **Writing Plans refinements** — incremental plan-writing cadence (skeleton first, one task per turn, prevents output token limits); added Problem Statement, User Stories, Assumptions to plan header; code-snippet review in plan reviewer prompt
- **Executing Plans** — "surgical changes only" rule to scope-limit each task's blast radius
- **Test orchestration** — `tests/run-all.sh` aggregates all 10 sub-runners with pass/fail counts; wiring regression test ensures every sub-runner stays referenced

## What's Integrated from superpowers-optimized (v6.1.0)

This release merges the best components from the [superpowers-optimized](https://github.com/obra/superpowers-optimized) fork:

### New Skills (+11)
- **token-efficiency** — Always-on baseline: parallel dispatch, exploration tracking, concise responses
- **context-management** — Cross-session state (project-map.md, state.md, session-log.md) — never re-explore
- **error-recovery** — known-issues.md error→solution map — fix recurring bugs in one step
- **self-consistency-reasoner** — Multi-path reasoning gate (3–5 hypotheses, majority vote, confidence gating)
- **refactoring** — Behavior-locked structural changes with characterization test safety net
- **dependency-management** — Incremental updates with CVE handling and impact assessment
- **performance-investigation** — Measure-first profiling (Baseline → Profile → Hypothesize → Fix → Re-measure)
- **premise-check** — "Should this exist?" gate before any design or plan
- **deliberation** — Stakeholder-perspective decision framing before brainstorming
- **frontend-design** — Production-grade UI (25 styles, 30 industry categories, WCAG AA, 10 quality standards)
- **claude-md-creator** — Minimal high-signal CLAUDE.md/AGENTS.md generation

### Enhanced Skills (+4)
- **using-superpowers** — 3-tier classification (micro/light/full), EnterPlanMode intercept, routing guide for all 25 skills
- **systematic-debugging** — Phase 0 (check known-issues), Self-Consistency Gate, post-fix KB updates
- **verification-before-completion** — Stub scan, config change verification, self-consistency evidence evaluation
- **test-driven-development** — Test infrastructure check, rationalization table, advanced test strategy

### Safety Hooks
- **Block dangerous commands** — 26 destructive patterns (rm -rf /, force push to main, fork bombs, etc.)
- **Protect secrets** — 50+ file patterns + 14 hardcoded secret detection patterns

### Bash Smart-Compress
- ~76% token savings on noisy commands (git status, npm install, passing tests)
- Opt-out: `SP_NO_COMPRESS=1`

### Tracking & Reminders
- Edit tracking, session stats, TDD/commit/state.md staleness reminders
- Opt-out: `SP_DISABLE_REMINDERS=1`

### Skill Activator
- Automatic skill routing via keyword + intent pattern matching (22 rules)
- Surfaces relevant session-log and known-issues entries mid-conversation

Full details: [RELEASE-NOTES.md](RELEASE-NOTES.md) and [integration summary](docs/superpowers/specs/2026-06-28-final-integration-summary.md).

## Quickstart

Give your agent Superpowers: [Claude Code](#claude-code), [Antigravity](#antigravity), [Codex App](#codex-app), [Codex CLI](#codex-cli), [Cursor](#cursor), [Factory Droid](#factory-droid), [Gemini CLI](#gemini-cli), [GitHub Copilot CLI](#github-copilot-cli), [Kimi Code](#kimi-code), [OpenCode](#opencode), [Pi](#pi).

## How it works

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it _doesn't_ just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do.

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest.

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY.

Next up, once you say "go", it launches a _subagent-driven-development_ process, having agents work through each engineering task, inspecting and reviewing their work, and continuing forward. It's not uncommon for your agent to work autonomously for a couple hours at a time without deviating from the plan you put together.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has Superpowers.

## Commercial Services

If you're using Superpowers in enterprise and could benefit from commercial support, additional tooling, or managed spending, please don't hesitate to drop us a line at sales@primeradiant.com.

## Installation

The install commands below use the fork's URL — [github.com/chankh70/superpowers-plus](https://github.com/chankh70/superpowers-plus). To install from a local clone of this fork instead (development against uncommitted changes), point your harness at the local checkout (e.g. `claude --plugin-dir /path/to/superpowers`, or `pi -e /path/to/superpowers`).

Installation differs by harness. If you use more than one, install Superpowers separately for each one.

### Claude Code

Superpowers is available via the [official Claude plugin marketplace](https://claude.com/plugins/superpowers)

#### Official Marketplace

- Install the plugin from Anthropic's official marketplace:

  ```bash
  /plugin install superpowers@claude-plugins-official
  ```

#### Superpowers Marketplace

The Superpowers marketplace provides Superpowers and some other related plugins for Claude Code.

- Register the marketplace:

  ```bash
  /plugin marketplace add chankh70/superpowers-plus
  ```

- Install the plugin from this marketplace:

  ```bash
  /plugin install superpowers-plus@superpowers-plus
  ```

### Antigravity

Install Superpowers as a plugin from this repository:

```bash
agy plugin install https://github.com/chankh70/superpowers-plus
```

Antigravity runs the plugin's session-start hook, so Superpowers is active from
the first message. Reinstall with the same command to update.

### Codex App

Superpowers is available via the [official Codex plugin marketplace](https://github.com/openai/plugins).

- In the Codex app, click on Plugins in the sidebar.
- You should see `Superpowers` in the Coding section.
- Click the `+` next to Superpowers and follow the prompts.

### Codex CLI

Superpowers is available via the [official Codex plugin marketplace](https://github.com/openai/plugins).

- Open the plugin search interface:

  ```bash
  /plugins
  ```

- Search for Superpowers Plus:

  ```bash
  superpowers-plus
  ```

- Select `Install Plugin`.

### Cursor

- In Cursor Agent chat, install from marketplace:

  ```text
  /add-plugin superpowers-plus
  ```

- Or search for "superpowers-plus" in the plugin marketplace.

### Factory Droid

- Register the marketplace:

  ```bash
  droid plugin marketplace add https://github.com/chankh70/superpowers-plus
  ```

- Install the plugin:

  ```bash
  droid plugin install superpowers-plus@chankh70/superpowers-plus
  ```

### Gemini CLI

- Install the extension:

  ```bash
  gemini extensions install https://github.com/chankh70/superpowers-plus
  ```

- Update later:

  ```bash
  gemini extensions update superpowers-plus
  ```

### GitHub Copilot CLI

- Register the marketplace:

  ```bash
  copilot plugin marketplace add chankh70/superpowers-plus
  ```

- Install the plugin:

  ```bash
  copilot plugin install superpowers-plus@chankh70/superpowers-plus
  ```

### Kimi Code

Superpowers is available in Kimi Code's plugin marketplace.

- Open Kimi Code's plugin manager:

  ```text
  /plugins
  ```

- Go to `Marketplace` > `Superpowers` and install it.

- Or install directly from this repository:

  ```text
  /plugins install https://github.com/chankh70/superpowers-plus
  ```

- Detailed docs: [docs/README.kimi.md](docs/README.kimi.md)

### OpenCode

OpenCode uses its own plugin install; install Superpowers separately even if you
already use it in another harness.

- Tell OpenCode:

  ```
  Fetch and follow instructions from https://raw.githubusercontent.com/chankh70/superpowers-plus/refs/heads/main/.opencode/INSTALL.md
  ```

- Detailed docs: [docs/README.opencode.md](docs/README.opencode.md)

### Pi

Install Superpowers as a Pi package from this repository:

```bash
pi install git:github.com/chankh70/superpowers-plus
```

For local development, run Pi with this checkout loaded as a temporary package:

```bash
pi -e /path/to/superpowers
```

The Pi package loads the Superpowers skills and a small extension that injects the `using-superpowers` bootstrap at session startup and again after compaction. Pi has native skills, so no compatibility `Skill` tool is required. Subagent and task-list tools remain optional Pi companion packages.

## The Basic Workflow

Every task is classified into one of three levels before work begins:

- **Micro** — Typos, single renames, 1-line config changes. Just do it. No skills needed.
- **Lightweight** — Small changes (~2 files, no new behavior, no cross-module risk). Go directly to implementation, gate with `verification-before-completion`.
- **Full** — Anything beyond micro or lightweight. Follow the complete pipeline below.

The agent remembers context across sessions via `project-map.md`, `state.md`, `session-log.md`, and `known-issues.md` — no re-exploring or re-debugging work you've already done.

For full tasks, the pipeline runs:

1. **premise-check** — "Should this exist at all?" Gate before any design or plan.

2. **brainstorming** — Activates before writing code. Refines rough ideas through questions, explores alternatives with parallel subagent fan-out, presents design in sections for validation. Saves design document.

3. **using-git-worktrees** — Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.

4. **writing-plans** — Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.

5. **subagent-driven-development** or **executing-plans** — Activates with plan. Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality), or executes with surgical-changes-only rule.

6. **test-driven-development** — Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit.

7. **requesting-code-review** — Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.

8. **verification-before-completion** — Stub scan, config verification, self-consistency check before claiming done.

9. **finishing-a-development-branch** — Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## What's Inside

### Skills Library (25 total)

**Testing**
- **test-driven-development** — RED-GREEN-REFACTOR cycle with advanced test strategy and rationalization table

**Debugging**
- **systematic-debugging** — 5-phase root cause process with Self-Consistency Gate and known-issues integration
- **verification-before-completion** — Stub scan, config change verification, self-consistency evidence evaluation

**Collaboration**
- **brainstorming** — Socratic design refinement with parallel subagent exploration
- **writing-plans** — Incremental plan-writing with Problem Statement, User Stories, and Global Constraints
- **executing-plans** — Task execution with surgical-changes-only rule
- **dispatching-parallel-agents** — Concurrent subagent workflows
- **requesting-code-review** — Pre-review checklist with security review
- **receiving-code-review** — Responding to feedback
- **using-git-worktrees** — Parallel development branches with native tool preference
- **finishing-a-development-branch** — Merge/PR decision workflow with provenance-based cleanup
- **subagent-driven-development** — Fast iteration with two-stage review

**Memory & Efficiency**
- **token-efficiency** — Always-on baseline: parallel dispatch, exploration tracking, concise responses
- **context-management** — Cross-session state (project-map.md, state.md, session-log.md)
- **error-recovery** — known-issues.md error→solution map
- **self-consistency-reasoner** — Internal multi-path reasoning gate (not user-invocable)

**Specialized Workflows**
- **refactoring** — Behavior-locked structural changes with characterization test safety net
- **dependency-management** — Incremental updates with CVE handling and impact assessment
- **performance-investigation** — Measure-first profiling (Baseline → Profile → Hypothesize → Fix → Re-measure)
- **frontend-design** — Production-grade UI with 25 styles, 30 industry categories, WCAG AA compliance

**Design & Decision**
- **premise-check** — "Should this exist?" gate before any design or plan
- **deliberation** — Stakeholder-perspective decision framing before brainstorming
- **claude-md-creator** — Minimal high-signal CLAUDE.md/AGENTS.md generation

**Meta**
- **writing-skills** — Create new skills following best practices
- **using-superpowers** — Entry point with 3-tier classification, routing guide for all 25 skills

## Philosophy

- **Test-Driven Development** — Write tests first, always. Red-green-refactor is non-negotiable.
- **Systematic over ad-hoc** — Process over guessing. Every bug gets root-cause analysis, not a patch.
- **Measurement-first** — Profile before optimizing. "I think this is faster" is not evidence.
- **Safety-by-default** — Dangerous commands are blocked, secrets are protected. Defense-in-depth, not trust.
- **Cross-session continuity** — Never re-explore, re-propose, or re-debug. State persists across sessions.
- **Complexity reduction** — Simplicity as primary goal. Premise-check before building. YAGNI.
- **Evidence over claims** — Verify before declaring success. Stub scan before claiming completion.

Read [the original release announcement](https://blog.fsck.com/2025/10/09/superpowers/).

## Contributing

The general contribution process for Superpowers is below. Keep in mind that we don't generally accept contributions of new skills and that any updates to skills must work across all of the coding agents we support.

1. Fork the repository
2. Switch to the 'dev' branch
3. Create a branch for your work
4. Follow the `writing-skills` skill for creating and testing new and modified skills
5. Submit a PR, being sure to fill in the pull request template.

Skill-behavior tests use the drill eval harness from [superpowers-evals](https://github.com/prime-radiant-inc/superpowers-evals/), cloned into `evals/` — see `evals/README.md` for setup. Plugin-infrastructure tests live at `tests/` and run via the relevant `run-*.sh` or `npm test`.

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

Superpowers updates are somewhat coding-agent dependent, but are often automatic.

## License

MIT License - see LICENSE file for details

## Visual companion telemetry

Because skills and plugins don't provide any feedback to creators, we have no idea how many of you are using Superpowers. By default, the Prime Radiant logo on brainstorming's optional visual companion feature is loaded from our website. It includes the version of Superpowers in use. It does not include any details about your project, prompt, or coding agent. We don't see your clicks or anything about what you're building. This helps us have a rough idea of how many folks are using Superpowers and which version of Superpowers they're using. It's 100% optional. To disable this, set the environment variable `SUPERPOWERS_DISABLE_TELEMETRY` to any true value. Superpowers also honors Claude Code's `DISABLE_TELEMETRY` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` opt-outs.

## Community

This fork is maintained by **Thomas/Jianfeng** ([@chankh70](https://github.com/chankh70)).

Superpowers was created by [Jesse Vincent](https://blog.fsck.com) and the team at [Prime Radiant](https://primeradiant.com). This fork's curated differences from upstream (parallel brainstorming, batched clarifying questions, server hardening, plan-writing cadence, surgical-changes rule, test orchestration) are described above; for everything else the upstream project retains copyright and attribution under the MIT license.

- **Discord**: [Join us](https://discord.gg/35wsABTejz) — the project shares one community space with upstream obra/superpowers
- **Issues against this fork**: [github.com/chankh70/superpowers-plus/issues](https://github.com/chankh70/superpowers-plus/issues)
- **Issues against upstream**: https://github.com/obra/superpowers/issues
- **Release announcements**: [Sign up](https://primeradiant.com/superpowers/) to get notified about new versions
