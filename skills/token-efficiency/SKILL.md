---
name: token-efficiency
description: Always-on operational standard. Enforces concise responses, parallel tool execution, no redundant work, exploration tracking, and proactive context compression throughout every session. Applied automatically at session start.
---

# Token Efficiency

Core operating standard for all sessions. Apply permanently from activation.

## Response Rules

1. Lead with the answer — no preambles, no restating the question
2. Use bullet points and code over prose narration
3. Never explain what you are about to do — just do it
4. Omit filler phrases ("Certainly!", "Great question!", "Now let me...", "As you can see...")
5. One question per clarification turn — collect all unknowns and ask them together, not one at a time
6. Prefer structured output (JSON/YAML) when the result feeds a downstream step

## Tool Execution Rules

1. Batch all independent tool calls in a single response — never serialize calls that can run in parallel
2. Do not re-read a file already read this session unless it was modified since
3. Match read scope to task type: use Grep to locate specific known content (a function, a config value, an error handler); read complete files when the task requires understanding what a file covers (scope assessment, gap analysis, systemic recommendations). Partial reads cannot prove absence.
4. Use Glob instead of Bash `ls` or `find`
5. Do not verify existence of a path already confirmed earlier in the session
6. The Read tool returns a maximum of 2,000 lines per call. For files you have reason to believe exceed 2,000 lines, use `offset` and `limit` parameters to read in sequential chunks. Never assume a single read covered the complete file.

## Exploration Tracking

Maintain a mental index of repository exploration performed in this session. Before every Read, Grep, or Glob call, check this index and skip the call if the result is already known and the file has not been modified since.

### What to Track

- **Files read**: path + whether you or any tool modified it since the read
- **Searches performed**: Grep/Glob pattern + directory scope + result summary
- **Directory structures explored**: which directories you've listed or globbed

### Decision Rules

| Situation | Action |
|---|---|
| File already read, not modified since | Do NOT re-read — use what you already know |
| File already read, but YOU edited it since | Re-read only the edited file |
| File already read, but another tool/agent may have changed it | Re-read — external changes invalidate your knowledge |
| Identical Grep/Glob pattern + same scope | Do NOT re-run — reuse the previous results |
| Similar but broader Grep/Glob pattern | Run the new search — it may surface new results |
| Context compression occurred (earlier turns disappeared) | Trust your remaining knowledge of file contents; only re-read if you genuinely cannot recall the content you need |

## Proactive Compaction Breakpoints

Do not wait for context to auto-compress mid-task. Break proactively at logical seams — before compaction forces it in the middle of implementation where you need variable names, file paths, and discovered facts intact.

**Phase-transition guide — when to break:**

| Transition | Break? | Reason |
|---|---|---|
| Research → Planning | Yes | Exploration context is bulky; the plan is the distilled output |
| Planning → Implementation | Yes | Plan is in files/TodoWrite; free context for code |
| Implementation → Testing | Maybe | Keep if tests reference recent code; break if switching focus |
| After a failed approach | Yes | Dead-end reasoning pollutes the next attempt |
| Debugging → next feature | Yes | Debug traces are noise for unrelated work |
| **Mid-implementation** | **No** | Losing variable names, discovered paths, and partial state mid-task is costly |

**Break context by:** invoking `context-management` to write `state.md` with discovered facts, then starting fresh with only `state.md` as input. Always save to `state.md` *before* compacting — never after.

## Anti-Patterns

- Reading a file to confirm it exists
- Re-reading a file you already read and haven't modified
- Re-running the same Grep/Glob search you already ran this session
- Re-exploring directory structure you already mapped
- Narrating steps before executing them
- Running the same check twice
- Generating reasoning that restates the user's message
- Splitting one turn's worth of work across multiple turns
- Writing long summaries of completed steps

## Activation

Active silently for the entire session. No confirmation output.
