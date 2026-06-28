# Parallel Brainstorming

Explore a wider solution space by spawning 2 subagents with contrasting perspectives in parallel, then using Fan-out / Fan-in to synthesize their outputs into a coherent design. Only use this when the user explicitly asks — it's a manual technique, not an automatic trigger.

## When to Use

The user might ask for parallel brainstorming when:
- The problem has a wide solution space with many plausible approaches
- There are divergent stakeholder interests or conflicting constraints to reconcile
- Creative diversity matters — they want to avoid anchoring on the first viable idea
- The domain is unfamiliar and they want breadth before depth

**Don't use when:**
- The problem is narrow and has one obvious best approach
- The user hasn't explicitly asked for it
- You haven't first done basic context-gathering and clarifying questions (steps 1-3 of the brainstorming checklist)

## How It Works

Instead of the coordinating agent generating approaches alone, it spawns 2 subagents in parallel — one pushing boundaries with radical, blue-sky ideas and the other grounding them with practical constraints. The subagents explore independently, then the coordinator uses Fan-out / Fan-in: fan out the same prompt to both agents concurrently, review the conflict and overlap, and fan in the best points from each to produce a unified set of approaches and a recommended design that merges radical concepts with practical reality.

## The Pattern

### Step 1: Define the core problem

Before dispatching, crystallize what you've learned from context exploration and clarifying questions. The problem statement must be:
- **Specific** about what's being built or decided
- **Scoped** to one coherent problem (decompose large projects first)
- **Self-contained** — a subagent reading only this statement should understand the task

### Step 2: Assign perspectives

The two agents form a deliberate creative-tension pair. The default assignment:

| Agent | Perspective | Focus |
|-------|-------------|-------|
| Agent A | **Visionary / Optimist** | Push boundaries. Think radically. Dream up blue-sky ideas without worrying about constraints, budget, or feasibility. What's the ideal outcome? What would a breakthrough look like? What haven't we considered? |
| Agent B | **Pragmatist / Critic** | Poke holes. Check feasibility. Assess budget, technical risks, timeline, and real-world constraints. What could go wrong? What's the simplest thing that works? Where's the hidden complexity? Ground the ideas in reality. |

The tension between these two perspectives produces better designs than either alone: Agent A stretches the solution space, Agent B keeps it anchored. Neither agent should try to balance — they should lean fully into their assigned lens.

**Keep exactly 2.** Don't add a third agent. The Visionary vs. Pragmatist tension is the engine of this technique.

### Step 3: Construct subagent prompts

Each subagent gets:
- The core problem statement (identical across both)
- Its assigned perspective with explicit framing
- A structured output format
- A scope boundary (what NOT to explore)

**Prompt template — Agent A (Visionary / Optimist):**

```
You are exploring design approaches for the following problem:

[PROBLEM STATEMENT]

Your perspective: Visionary / Optimist

Push boundaries. Think radically. Dream up blue-sky ideas without worrying about constraints, budget, or technical feasibility. Your job is to stretch the solution space as wide as possible — don't self-censor or pre-filter. What's the ideal outcome? What would a breakthrough look like? What haven't we considered?

Explore the problem from this perspective. Be bold. Don't converge on the first viable approach — generate genuinely different directions.

Output your analysis in this format:

## Approaches (2-3)
For each approach:
- Name (short label)
- Description (2-3 sentences — sell the vision)
- Why it's compelling (from a visionary standpoint)
- What's audacious about it

## Key Insights
- What opportunities is the conventional approach missing?
- What would you build if there were zero constraints?

## Recommendation
- Which approach excites you most and why?
- What's the biggest unknown or assumption behind it?

Scope: Focus on design and approach selection. Do NOT write implementation code or detailed specs.
```

**Prompt template — Agent B (Pragmatist / Critic):**

```
You are exploring design approaches for the following problem:

[PROBLEM STATEMENT]

Your perspective: Pragmatist / Critic

Poke holes. Check feasibility. Assess budget, technical risks, timeline, and real-world constraints. What could go wrong? What's the simplest thing that actually works? Where's the hidden complexity? Ground ideas in reality. Your job is to stress-test every assumption and surface what's being glossed over.

Explore the problem from this perspective. Be skeptical — look for gaps, risks, and over-engineering. What can we cut? What's the minimum that delivers value?

Output your analysis in this format:

## Approaches (2-3)
For each approach:
- Name (short label)
- Description (2-3 sentences)
- Feasibility assessment
- Risks and failure modes

## Key Insights
- What's being overlooked or hand-waved?
- What's the simplest viable path?

## Recommendation
- Which approach is the safest bet and why?
- What's the biggest risk with your recommendation?

Scope: Focus on design and approach selection. Do NOT write implementation code or detailed specs.
```

### Step 4: Fan-out — Dispatch both in parallel

Issue both subagent dispatches in ONE response so they run concurrently:

```text
Subagent (Visionary)  → "Explore [problem] — push boundaries, blue-sky thinking"
Subagent (Pragmatist) → "Explore [problem] — stress-test, find risks, ground in reality"
# Both run concurrently.
```

Each subagent must be self-contained — it should NOT inherit your session's context. Construct exactly what it needs.

### Step 5: Collect outputs

When both subagents return, read each output. Verify all three criteria are met for each:

1. Produced at least 2 approaches
2. Produced a recommendation with explicit rationale
3. Stayed within scope (no implementation code, no detailed specs)

If either subagent's output fails any criterion, re-dispatch it with more specific framing. Do NOT proceed to synthesis until both pass.

### Step 6: Review — find conflict and overlap

Read both outputs side by side looking for:

1. **Overlap** — ideas both agents surfaced independently. These are strong signals — when the Visionary dreams it AND the Pragmatist validates it, pay attention.
2. **Conflict** — where agents disagree. The Visionary says "this is the future" and the Pragmatist says "this will fail because of X." These tensions are where the most valuable design conversations happen.

### Step 7: Fan-in — synthesize

As the coordinator, now take the best points from both agents and merge the radical concepts of Agent A with the practical constraints of Agent B. The synthesis should pull the best from both: Visionary ambition hardened by Pragmatist scrutiny.

Present the synthesis to the user as:

```
## Synthesis

**Convergence (both agents independently surfaced):** [2-3 ideas that appeared in both outputs — strongest signal]

**Visionary's best ideas (Agent A):** [1-2 radical ideas worth pursuing, even if they need adaptation]

**Pragmatist's reality checks (Agent B):** [1-2 constraints or risks that MUST be addressed]

**Tensions to resolve:** [where agents disagreed — ask the user to weigh in]

**Synthesized approaches:** [2-3 approaches that merge Visionary ambition with Pragmatist grounding. For each, note which agent contributed what.]

**My recommendation:** [your overall recommendation, hardened by both perspectives. What to build, what risks to mitigate, what to defer.]
```

### Step 8: Resume brainstorming flow

After presenting the synthesis, resume the normal brainstorming flow:
- Let the user react to the synthesis
- Present the design in sections, get approval
- Continue with the remaining checklist steps (design doc, spec review, transition to writing-plans)

## Fan-out / Fan-in Summary

```
FAN-OUT  →  Submit the same prompt to both agents concurrently
            Agent A (Visionary): push boundaries, blue-sky
            Agent B (Pragmatist): poke holes, ground in reality

REVIEW   →  Look at conflict and overlap between the two sets of ideas

FAN-IN   →  Feed the best points from both into the coordinator
            Merge radical concepts (A) with practical constraints (B)
```

## Integration with Brainstorming Flow

Parallel brainstorming fits between steps 3 (clarifying questions) and 4 (propose approaches) of the brainstorming checklist:

```
1. Explore project context ✓
2. Offer visual companion (if applicable) ✓
3. Ask clarifying questions ✓
   ↓
   User asks for parallel brainstorming
   ↓
   → Run the 8-step parallel pattern (this document)
   ↓
4. Propose 2-3 approaches (informed by synthesis)
5. Present design sections
...
```

The synthesis from parallel brainstorming replaces "Propose 2-3 approaches" — you don't do both. The synthesis IS your approach proposal.

## Common Mistakes

**❌ Using without clarifying questions first.** Parallel brainstorming needs a well-defined problem. Do steps 1-3 of the checklist first.
**✅** Always crystallize the problem statement based on real context and user input.

**❌ Making both agents balanced.** "Consider both radical and practical perspectives" defeats the purpose — neither agent stretches far enough.
**✅** Each agent must lean fully into its assigned lens. Agent A should be unapologetically optimistic. Agent B should be unapologetically skeptical.

**❌ Subagent prompts too vague.** "Explore this problem" without sharp perspective framing produces unfocused output.
**✅** Give each agent a specific lens: Visionary gets "dream without constraints" framing; Pragmatist gets "find what breaks" framing.

**❌ Synthesizing superficially.** Listing all ideas without resolving conflict misses the value.
**✅** Hunt for overlap (strong signal), conflict (design tension), and merge Visionary ambition with Pragmatist grounding.

**❌ Continuing to next steps without user reaction.** The synthesis is input for the design conversation, not the final answer.
**✅** Present the synthesis, then ask the user what resonates and what they want to dive deeper into.
